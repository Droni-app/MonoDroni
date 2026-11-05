import { createHash, randomBytes } from 'node:crypto'
import { test } from '@japa/runner'
import type { Assert } from '@japa/assert'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'
import OauthClient from '#models/oauth/oauth_client'
import OauthGrant from '#models/oauth/oauth_grant'
import Site from '#models/site'
import User from '#models/user'
import { hashToken } from '#services/oauth/oauth_service'
import env from '#start/env'

// Routes are typed by their controllers, which don't describe OAuth's form bodies or error unions
type TestContext = { client: any; assert: Assert }

const BASE = env.get('APP_URL').replace(/\/+$/, '')
const REDIRECT_URI = 'https://client.example/callback'
const CSRF = 'test-csrf'
const INITIALIZE = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2025-06-18',
    capabilities: {},
    clientInfo: { name: 'test', version: '1' },
  },
}

function pkce() {
  const verifier = randomBytes(32).toString('base64url')
  return { verifier, challenge: createHash('sha256').update(verifier).digest('base64url') }
}

async function createUser() {
  const user = await User.create({
    fullName: 'Tester',
    email: `${crypto.randomUUID()}@example.com`,
    password: 'password123',
  })
  user.emailVerifiedAt = DateTime.now()
  await user.save()
  return user
}

function createSite(overrides: Partial<{ logo: string; url: string }> = {}) {
  return Site.create({
    name: `Sitio ${crypto.randomUUID()}`,
    url: 'https://sitio.example',
    description: 'Descripción del sitio',
    ...overrides,
  })
}

function createClient() {
  return OauthClient.create({
    id: crypto.randomUUID(),
    type: 'dynamic',
    name: 'Test client',
    redirectUris: [REDIRECT_URI],
    grantTypes: ['authorization_code', 'refresh_token'],
    tokenEndpointAuthMethod: 'none',
  })
}

function authorizeQuery(
  clientId: string,
  challenge: string,
  overrides: Record<string, string> = {}
) {
  return new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    state: 'xyz',
    resource: `${BASE}/mcp/content`,
    ...overrides,
  }).toString()
}

test.group('OAuth for MCP connectors', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  /** Runs the consent step and returns the authorization code. */
  async function authorize(
    client: any,
    user: User,
    clientId: string,
    challenge: string,
    overrides = {}
  ) {
    const response = await client
      .post('/oauth/authorize')
      .withGuard('web')
      .loginAs(user)
      .withSession({ 'oauth.csrf': CSRF })
      .form({
        _csrf: CSRF,
        decision: 'allow',
        params: authorizeQuery(clientId, challenge, overrides),
      })
      .redirects(0)
    response.assertStatus(303)
    return new URL(response.header('location'))
  }

  async function connect(client: any, overrides: Record<string, string> = {}) {
    const user = await createUser()
    const oauthClient = await createClient()
    const { verifier, challenge } = pkce()
    const redirect = await authorize(client, user, oauthClient.id, challenge, overrides)
    const response = await client.post('/oauth/token').form({
      grant_type: 'authorization_code',
      client_id: oauthClient.id,
      code: redirect.searchParams.get('code'),
      code_verifier: verifier,
      redirect_uri: REDIRECT_URI,
    })
    response.assertStatus(200)
    return { user, oauthClient, tokens: response.body(), verifier, redirect }
  }

  const mcpPost = (client: any, path: string, token?: string) => {
    const request = client
      .post(path)
      .header('accept', 'application/json, text/event-stream')
      .json(INITIALIZE)
    return token ? request.header('authorization', `Bearer ${token}`) : request
  }

  test('an unauthenticated MCP request points to discovery', async ({
    client,
    assert,
  }: TestContext) => {
    const response = await mcpPost(client, '/mcp/content')
    response.assertStatus(401)
    assert.include(
      response.header('www-authenticate'),
      `resource_metadata="${BASE}/.well-known/oauth-protected-resource/mcp/content"`
    )
  })

  test('discovery documents describe the server', async ({ client, assert }: TestContext) => {
    const resource = await client.get('/.well-known/oauth-protected-resource/mcp/content')
    resource.assertStatus(200)
    assert.equal(resource.body().resource, `${BASE}/mcp/content`)
    assert.deepEqual(resource.body().authorization_servers, [BASE])

    const server = await client.get('/.well-known/oauth-authorization-server')
    server.assertStatus(200)
    assert.equal(server.body().issuer, BASE)
    assert.deepEqual(server.body().code_challenge_methods_supported, ['S256'])
    assert.isTrue(server.body().client_id_metadata_document_supported)
    assert.isTrue(server.body().authorization_response_iss_parameter_supported)

    const unknown = await client.get('/.well-known/oauth-protected-resource/mcp/nope')
    unknown.assertStatus(404)
  })

  test('dynamic registration validates and stores the client', async ({
    client,
    assert,
  }: TestContext) => {
    const created = await client.post('/oauth/register').json({
      client_name: 'Asistente',
      redirect_uris: [REDIRECT_URI],
      token_endpoint_auth_method: 'none',
    })
    created.assertStatus(201)
    assert.isUndefined(created.body().client_secret)

    const stored = await OauthClient.findOrFail(created.body().client_id)
    assert.deepEqual(stored.redirectUris, [REDIRECT_URI])

    const invalid = await client
      .post('/oauth/register')
      .json({ redirect_uris: ['http://evil.example/cb'] })
    invalid.assertStatus(400)
    assert.equal(invalid.body().error, 'invalid_redirect_uri')
  })

  test('authorize never redirects to an unregistered URI', async ({
    client,
    assert,
  }: TestContext) => {
    const oauthClient = await createClient()
    const response = await client
      .get(
        `/oauth/authorize?${authorizeQuery(oauthClient.id, pkce().challenge, {
          redirect_uri: 'https://evil.example/cb',
        })}`
      )
      .redirects(0)
    response.assertStatus(400)
    assert.isUndefined(response.header('location'))
  })

  test('authorize requires PKCE, reporting it to the client', async ({
    client,
    assert,
  }: TestContext) => {
    const oauthClient = await createClient()
    const response = await client
      .get(
        `/oauth/authorize?${authorizeQuery(oauthClient.id, pkce().challenge, { code_challenge_method: 'plain' })}`
      )
      .redirects(0)
    response.assertStatus(302)
    const location = new URL(response.header('location'))
    assert.equal(location.searchParams.get('error'), 'invalid_request')
    assert.equal(location.searchParams.get('state'), 'xyz')
    assert.equal(location.searchParams.get('iss'), BASE)
  })

  test('authorize shows login, then consent naming client and host', async ({
    client,
    assert,
  }: TestContext) => {
    const oauthClient = await createClient()
    const query = authorizeQuery(oauthClient.id, pkce().challenge)

    const login = await client.get(`/oauth/authorize?${query}`)
    login.assertStatus(200)
    assert.include(login.text(), 'action="/oauth/login"')
    assert.equal(login.header('x-frame-options'), 'DENY')

    const user = await createUser()
    const consent = await client.get(`/oauth/authorize?${query}`).withGuard('web').loginAs(user)
    consent.assertStatus(200)
    assert.include(consent.text(), 'Test client')
    assert.include(consent.text(), 'client.example')
    assert.include(consent.text(), 'action="/oauth/authorize"')
  })

  test('the login form checks credentials and CSRF', async ({ client, assert }: TestContext) => {
    const user = await createUser()
    const oauthClient = await createClient()
    const params = authorizeQuery(oauthClient.id, pkce().challenge)

    const noCsrf = await client
      .post('/oauth/login')
      .form({ email: user.email, password: 'password123', params })
    noCsrf.assertStatus(400)

    const wrong = await client
      .post('/oauth/login')
      .withSession({ 'oauth.csrf': CSRF })
      .form({ _csrf: CSRF, email: user.email, password: 'wrong-password', params })
    wrong.assertStatus(200)
    assert.include(wrong.text(), 'Correo o contraseña incorrectos')

    const ok = await client
      .post('/oauth/login')
      .withSession({ 'oauth.csrf': CSRF })
      .form({ _csrf: CSRF, email: user.email, password: 'password123', params })
      .redirects(0)
    ok.assertStatus(303)
    assert.include(ok.header('location'), '/oauth/authorize?')
  })

  test('consent requires CSRF and can be denied', async ({ client, assert }: TestContext) => {
    const user = await createUser()
    const oauthClient = await createClient()
    const params = authorizeQuery(oauthClient.id, pkce().challenge)

    const forged = await client
      .post('/oauth/authorize')
      .withGuard('web')
      .loginAs(user)
      .withSession({ 'oauth.csrf': CSRF })
      .form({ _csrf: 'other', decision: 'allow', params })
    forged.assertStatus(400)

    const denied = await client
      .post('/oauth/authorize')
      .withGuard('web')
      .loginAs(user)
      .withSession({ 'oauth.csrf': CSRF })
      .form({ _csrf: CSRF, decision: 'deny', params })
      .redirects(0)
    denied.assertStatus(303)
    const location = new URL(denied.header('location'))
    assert.equal(location.searchParams.get('error'), 'access_denied')
    assert.isNull(location.searchParams.get('code'))
  })

  test('the full flow yields a token that can call MCP tools', async ({
    client,
    assert,
  }: TestContext) => {
    const { tokens, redirect, user } = await connect(client)
    assert.equal(redirect.searchParams.get('state'), 'xyz')
    assert.equal(redirect.searchParams.get('iss'), BASE)
    assert.match(tokens.access_token, /^mcpat_/)
    assert.match(tokens.refresh_token, /^mcprt_/)
    assert.equal(tokens.token_type, 'Bearer')

    const initialize = await mcpPost(client, '/mcp/content', tokens.access_token)
    initialize.assertStatus(200)
    assert.equal(initialize.body().result.serverInfo.name, 'appi-content')

    // list_my_sites replays auth/sites over loopback, which requires a real user session
    const site = await Site.create({ name: 'Demo', url: 'https://demo.example' })
    await user.related('enrollments').create({ siteId: site.id, role: 'owner' })
    const sites = await client
      .post('/mcp/content')
      .header('accept', 'application/json, text/event-stream')
      .header('authorization', `Bearer ${tokens.access_token}`)
      .json({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: { name: 'list_my_sites', arguments: {} },
      })
    sites.assertStatus(200)
    assert.isFalse(sites.body().result.isError)
    assert.include(sites.body().result.content[0].text, site.id)
  })

  test('a code needs the right verifier and works only once', async ({
    client,
    assert,
  }: TestContext) => {
    const user = await createUser()
    const oauthClient = await createClient()
    const { verifier, challenge } = pkce()
    const redirect = await authorize(client, user, oauthClient.id, challenge)
    const body = {
      grant_type: 'authorization_code',
      client_id: oauthClient.id,
      code: redirect.searchParams.get('code'),
    }

    const badVerifier = await client
      .post('/oauth/token')
      .form({ ...body, code_verifier: pkce().verifier })
    badVerifier.assertStatus(400)
    assert.equal(badVerifier.body().error, 'invalid_grant')

    const first = await client.post('/oauth/token').form({ ...body, code_verifier: verifier })
    first.assertStatus(200)

    // Replaying the code also kills what it issued
    const replay = await client.post('/oauth/token').form({ ...body, code_verifier: verifier })
    replay.assertStatus(400)
    const revoked = await mcpPost(client, '/mcp/content', first.body().access_token)
    revoked.assertStatus(401)
  })

  test('a code only works for the client it was issued to', async ({ client }: TestContext) => {
    const user = await createUser()
    const oauthClient = await createClient()
    const other = await createClient()
    const { verifier, challenge } = pkce()
    const redirect = await authorize(client, user, oauthClient.id, challenge)

    const response = await client.post('/oauth/token').form({
      grant_type: 'authorization_code',
      client_id: other.id,
      code: redirect.searchParams.get('code'),
      code_verifier: verifier,
    })
    response.assertStatus(400)
  })

  test('refresh rotates, and replaying an old token revokes the grant', async ({
    client,
    assert,
  }: TestContext) => {
    const { oauthClient, tokens } = await connect(client)
    const refresh = (token: string) =>
      client.post('/oauth/token').form({
        grant_type: 'refresh_token',
        client_id: oauthClient.id,
        refresh_token: token,
      })

    const rotated = await refresh(tokens.refresh_token)
    rotated.assertStatus(200)
    assert.notEqual(rotated.body().refresh_token, tokens.refresh_token)

    const oldAccess = await mcpPost(client, '/mcp/content', tokens.access_token)
    oldAccess.assertStatus(401)
    const newAccess = await mcpPost(client, '/mcp/content', rotated.body().access_token)
    newAccess.assertStatus(200)

    const replay = await refresh(tokens.refresh_token)
    replay.assertStatus(400)
    const killed = await mcpPost(client, '/mcp/content', rotated.body().access_token)
    killed.assertStatus(401)
    const stillDead = await refresh(rotated.body().refresh_token)
    stillDead.assertStatus(400)
  })

  test('confidential clients must present their secret', async ({ client }: TestContext) => {
    const created = await client
      .post('/oauth/register')
      .json({ redirect_uris: [REDIRECT_URI], token_endpoint_auth_method: 'client_secret_post' })
    const { client_id: clientId, client_secret: secret } = created.body()
    const user = await createUser()
    const { verifier, challenge } = pkce()
    const redirect = await authorize(client, user, clientId, challenge)
    const body = {
      grant_type: 'authorization_code',
      client_id: clientId,
      code: redirect.searchParams.get('code'),
      code_verifier: verifier,
    }

    const missing = await client.post('/oauth/token').form(body)
    missing.assertStatus(401)
    const ok = await client
      .post('/oauth/token')
      .basicAuth(encodeURIComponent(clientId), encodeURIComponent(secret))
      .form(body)
    ok.assertStatus(200)
  })

  test('tokens are bound to their MCP resource', async ({ client }: TestContext) => {
    const { tokens } = await connect(client)
    const otherModule = await mcpPost(client, '/mcp/store', tokens.access_token)
    otherModule.assertStatus(401)
  })

  test('a site-bound token cannot be moved with x-site-id', async ({
    client,
    assert,
  }: TestContext) => {
    const site = await Site.create({ name: 'A', url: 'https://a.example' })
    const other = await Site.create({ name: 'B', url: 'https://b.example' })
    const { tokens } = await connect(client, { resource: `${BASE}/mcp/${site.id}/content` })

    const pinned = await mcpPost(client, `/mcp/${site.id}/content`, tokens.access_token)
    pinned.assertStatus(200)
    const otherUrl = await mcpPost(client, `/mcp/${other.id}/content`, tokens.access_token)
    otherUrl.assertStatus(401)

    const list = await client
      .post(`/mcp/${site.id}/content`)
      .header('accept', 'application/json, text/event-stream')
      .header('authorization', `Bearer ${tokens.access_token}`)
      .header('x-site-id', other.id)
      .json({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: { name: 'list_posts', arguments: {} },
      })
    list.assertStatus(200)
    assert.notInclude(list.text(), other.id)
    const post = await client.get('/auth/sites').header('x-site-id', site.id)
    post.assertStatus(401)
  })

  test('a token without resource works on every module', async ({ client }: TestContext) => {
    const user = await createUser()
    const oauthClient = await createClient()
    const { verifier, challenge } = pkce()
    const params = new URLSearchParams(authorizeQuery(oauthClient.id, challenge))
    params.delete('resource')
    const consent = await client
      .post('/oauth/authorize')
      .withGuard('web')
      .loginAs(user)
      .withSession({ 'oauth.csrf': CSRF })
      .form({ _csrf: CSRF, decision: 'allow', params: params.toString() })
      .redirects(0)
    const tokens = await client.post('/oauth/token').form({
      grant_type: 'authorization_code',
      client_id: oauthClient.id,
      code: new URL(consent.header('location')).searchParams.get('code'),
      code_verifier: verifier,
    })
    tokens.assertStatus(200)

    const content = await mcpPost(client, '/mcp/content', tokens.body().access_token)
    content.assertStatus(200)
    const store = await mcpPost(client, '/mcp/store', tokens.body().access_token)
    store.assertStatus(200)
  })

  test('credentials stay apart from the REST API', async ({ client }: TestContext) => {
    const { tokens, user } = await connect(client)

    const rest = await client
      .get('/auth/sites')
      .header('authorization', `Bearer ${tokens.access_token}`)
    rest.assertStatus(401)

    const apiToken = await User.accessTokens.create(user)
    const mcp = await mcpPost(client, '/mcp/content', apiToken.value!.release())
    mcp.assertStatus(401)
  })

  test('tool calls leave no loopback tokens behind', async ({ client, assert }: TestContext) => {
    const { tokens, user } = await connect(client)
    const response = await client
      .post('/mcp/content')
      .header('accept', 'application/json, text/event-stream')
      .header('authorization', `Bearer ${tokens.access_token}`)
      .json({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: { name: 'list_my_sites', arguments: {} },
      })
    response.assertStatus(200)
    await new Promise((resolve) => setTimeout(resolve, 200))
    const remaining = await User.accessTokens.all(user)
    assert.lengthOf(remaining, 0)
  })

  test('revocation invalidates the tokens', async ({ client, assert }: TestContext) => {
    const { oauthClient, tokens } = await connect(client)
    const revoked = await client
      .post('/oauth/revoke')
      .form({ client_id: oauthClient.id, token: tokens.refresh_token })
    revoked.assertStatus(200)

    const response = await mcpPost(client, '/mcp/content', tokens.access_token)
    response.assertStatus(401)
    const grant = await OauthGrant.findByOrFail('client_id', oauthClient.id)
    assert.isNotNull(grant.revokedAt)
  })

  test('expired access tokens are rejected', async ({ client }: TestContext) => {
    const { oauthClient, tokens } = await connect(client)
    await OauthGrant.query()
      .where('client_id', oauthClient.id)
      .update({
        access_expires_at: DateTime.now().minus({ hours: 1 }).toSQL({ includeOffset: false }),
      })
    const response = await mcpPost(client, '/mcp/content', tokens.access_token)
    response.assertStatus(401)
  })

  test('metadata document clients must resolve to a public host', async ({
    client,
  }: TestContext) => {
    const response = await client.get(
      `/oauth/authorize?${authorizeQuery('https://localhost/client.json', pkce().challenge)}`
    )
    response.assertStatus(400)
  })

  test('a cached metadata document authorizes without a fetch', async ({
    client,
    assert,
  }: TestContext) => {
    const clientId = 'https://client.example/oauth/client.json'
    await OauthClient.create({
      id: clientId,
      type: 'metadata_document',
      name: 'Cached client',
      redirectUris: [REDIRECT_URI],
      grantTypes: ['authorization_code'],
      tokenEndpointAuthMethod: 'none',
      metadataExpiresAt: DateTime.now().plus({ hours: 1 }),
    })
    const user = await createUser()
    const consent = await client
      .get(`/oauth/authorize?${authorizeQuery(clientId, pkce().challenge)}`)
      .withGuard('web')
      .loginAs(user)
    consent.assertStatus(200)
    assert.include(consent.text(), 'Cached client')
  })

  test('CORS opens token endpoints but not the consent pages', async ({
    client,
    assert,
  }: TestContext) => {
    const token = await client.post('/oauth/token').header('origin', 'https://web.example').form({})
    assert.equal(token.header('access-control-allow-origin'), 'https://web.example')

    const page = await client.get('/oauth/authorize').header('origin', 'https://web.example')
    assert.isUndefined(page.header('access-control-allow-origin'))
  })
})

test.group('OAuth for first-party clients', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  const SECRET = 'first-party-secret'

  async function createFirstPartyClient(existingSiteId?: string) {
    const site = existingSiteId ? null : await createSite()
    const siteId = existingSiteId ?? site!.id
    return OauthClient.create({
      id: crypto.randomUUID(),
      type: 'first_party',
      name: 'Droni Site',
      siteId,
      secretHash: hashToken(SECRET),
      redirectUris: [REDIRECT_URI],
      grantTypes: ['authorization_code'],
      tokenEndpointAuthMethod: 'client_secret_post',
    })
  }

  const login = (client: any, user: User, clientId: string, challenge: string) =>
    client
      .post('/oauth/login')
      .withSession({ 'oauth.csrf': CSRF })
      .form({
        _csrf: CSRF,
        email: user.email,
        password: 'password123',
        params: authorizeQuery(clientId, challenge, { resource: '' }),
      })
      .redirects(0)

  async function codeFor(client: any) {
    const user = await createUser()
    const oauthClient = await createFirstPartyClient()
    const { verifier, challenge } = pkce()
    const response = await login(client, user, oauthClient.id, challenge)
    response.assertStatus(303)
    const code = new URL(response.header('location')).searchParams.get('code')
    return { user, oauthClient, verifier, code, response }
  }

  const exchange = (client: any, clientId: string, code: string | null, verifier: string) =>
    client.post('/oauth/token').form({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: SECRET,
      code,
      code_verifier: verifier,
      redirect_uri: REDIRECT_URI,
    })

  test('login goes straight back with a code and leaves no session', async ({
    client,
    assert,
  }: TestContext) => {
    const { response, code } = await codeFor(client)
    assert.isString(code)
    assert.notProperty(response.session(), 'auth_web')

    // The same login does open a session for a connector, so the check above means something
    const connector = await createClient()
    const connectorLogin = await login(client, await createUser(), connector.id, pkce().challenge)
    connectorLogin.assertStatus(303)
    assert.property(connectorLogin.session(), 'auth_web')
  })

  test('an open session neither skips the login nor issues a code', async ({
    client,
    assert,
  }: TestContext) => {
    const user = await createUser()
    const oauthClient = await createFirstPartyClient()
    const { challenge } = pkce()
    const query = authorizeQuery(oauthClient.id, challenge, { resource: '' })

    const page = await client.get(`/oauth/authorize?${query}`).withGuard('web').loginAs(user)
    page.assertStatus(200)
    assert.include(page.text(), 'name="password"')

    const decision = await client
      .post('/oauth/authorize')
      .withGuard('web')
      .loginAs(user)
      .withSession({ 'oauth.csrf': CSRF })
      .form({ _csrf: CSRF, decision: 'allow', params: query })
      .redirects(0)
    decision.assertStatus(200)
    assert.include(decision.text(), 'name="password"')
  })

  test('the code exchanges for a token that works on REST but not on MCP', async ({
    client,
    assert,
  }: TestContext) => {
    const { oauthClient, code, verifier } = await codeFor(client)
    const response = await exchange(client, oauthClient.id, code, verifier)
    response.assertStatus(200)
    const { access_token: token, refresh_token: refreshToken } = response.body()
    assert.match(token, /^oat_/)
    assert.isUndefined(refreshToken)

    const rest = await client.get('/auth/sites').header('authorization', `Bearer ${token}`)
    rest.assertStatus(200)

    const mcp = await client
      .post('/mcp/content')
      .header('accept', 'application/json, text/event-stream')
      .header('authorization', `Bearer ${token}`)
      .json(INITIALIZE)
    mcp.assertStatus(401)
  })

  test('the token can be logged out from the REST API', async ({ client }: TestContext) => {
    const { oauthClient, code, verifier } = await codeFor(client)
    const exchanged = await exchange(client, oauthClient.id, code, verifier)
    const token = exchanged.body().access_token
    const site = await Site.firstOrFail()

    const logout = await client
      .post('/auth/logout')
      .header('authorization', `Bearer ${token}`)
      .header('x-site-id', site.id)
    logout.assertStatus(200)

    const rest = await client.get('/auth/sites').header('authorization', `Bearer ${token}`)
    rest.assertStatus(401)
  })

  test('the exchange requires the secret, the verifier and an unused code', async ({
    client,
  }: TestContext) => {
    const { oauthClient, code, verifier } = await codeFor(client)
    const form = {
      grant_type: 'authorization_code',
      client_id: oauthClient.id,
      code,
      code_verifier: verifier,
      redirect_uri: REDIRECT_URI,
    }

    const noSecret = await client.post('/oauth/token').form(form)
    noSecret.assertStatus(401)
    const wrongSecret = await client.post('/oauth/token').form({ ...form, client_secret: 'wrong' })
    wrongSecret.assertStatus(401)
    const wrongVerifier = await exchange(client, oauthClient.id, code, pkce().verifier)
    wrongVerifier.assertStatus(400)

    const valid = await exchange(client, oauthClient.id, code, verifier)
    valid.assertStatus(200)
    const replay = await exchange(client, oauthClient.id, code, verifier)
    replay.assertStatus(400)
  })

  test('registration can never create a first-party client', async ({
    client,
    assert,
  }: TestContext) => {
    const site = await createSite()
    const response = await client.post('/oauth/register').json({
      type: 'first_party',
      site_id: site.id,
      client_name: 'Droni Site',
      redirect_uris: [REDIRECT_URI],
      token_endpoint_auth_method: 'none',
    })
    response.assertStatus(201)
    const created = await OauthClient.findOrFail(response.body().client_id)
    assert.equal(created.type, 'dynamic')
    assert.isNull(created.siteId)
  })

  test("the login page shows the basic information of the client's site", async ({
    client,
    assert,
  }: TestContext) => {
    const site = await createSite({ logo: 'https://cdn.example/logo.png' })
    const oauthClient = await createFirstPartyClient(site.id)
    const query = authorizeQuery(oauthClient.id, pkce().challenge, { resource: '' })

    const page = await client.get(`/oauth/authorize?${query}`)
    page.assertStatus(200)
    assert.include(page.text(), site.name)
    assert.include(page.text(), 'Descripción del sitio')
    assert.include(page.text(), 'sitio.example')
    assert.include(page.text(), 'src="https://cdn.example/logo.png"')
    assert.include(page.header('content-security-policy'), 'img-src https:')
    assert.notInclude(page.text(), 'Sitio al que pide acceso')
  })

  test('a logo that is not https falls back to the initial', async ({
    client,
    assert,
  }: TestContext) => {
    const site = await createSite({ logo: 'javascript:alert(1)', url: 'no es una url' })
    const oauthClient = await createFirstPartyClient(site.id)
    const query = authorizeQuery(oauthClient.id, pkce().challenge, { resource: '' })

    const page = await client.get(`/oauth/authorize?${query}`)
    page.assertStatus(200)
    assert.notInclude(page.text(), 'javascript:')
    assert.include(page.text(), 'site-initial')
  })

  test('a connector shows its site as the target, never as its identity', async ({
    client,
    assert,
  }: TestContext) => {
    const site = await createSite()
    const oauthClient = await createClient()
    const query = authorizeQuery(oauthClient.id, pkce().challenge, {
      resource: `${BASE}/mcp/${site.id}/content`,
    })

    const page = await client.get(`/oauth/authorize?${query}`)
    page.assertStatus(200)
    assert.include(page.text(), 'Sitio al que pide acceso')
    assert.include(page.text(), site.name)
    assert.include(page.text(), 'Test client')

    const multiSite = await client.get(
      `/oauth/authorize?${authorizeQuery(oauthClient.id, pkce().challenge)}`
    )
    multiSite.assertStatus(200)
    assert.notInclude(multiSite.text(), 'Sitio al que pide acceso')
  })

  test('google login sends an exact redirect_uri and needs the csrf token', async ({
    client,
    assert,
  }: TestContext) => {
    const oauthClient = await createFirstPartyClient()
    const params = authorizeQuery(oauthClient.id, pkce().challenge, { resource: '' })

    const response = await client
      .post('/oauth/google')
      .withSession({ 'oauth.csrf': CSRF })
      .form({ _csrf: CSRF, params })
      .redirects(0)
    response.assertStatus(302)
    const google = new URL(response.header('location'))
    assert.equal(google.hostname, 'accounts.google.com')
    assert.equal(google.searchParams.get('redirect_uri'), `${BASE}/oauth/google/callback`)
    assert.isNotNull(google.searchParams.get('state'))
    assert.equal(response.session('oauth.pending'), params)

    const noCsrf = await client.post('/oauth/google').form({ params }).redirects(0)
    noCsrf.assertStatus(400)
  })

  test('connectors still get MCP tokens only', async ({ client, assert }: TestContext) => {
    const oauthClient = await createClient()
    const user = await createUser()
    const { verifier, challenge } = pkce()
    const consent = await client
      .post('/oauth/authorize')
      .withGuard('web')
      .loginAs(user)
      .withSession({ 'oauth.csrf': CSRF })
      .form({ _csrf: CSRF, decision: 'allow', params: authorizeQuery(oauthClient.id, challenge) })
      .redirects(0)
    const response = await client.post('/oauth/token').form({
      grant_type: 'authorization_code',
      client_id: oauthClient.id,
      code: new URL(consent.header('location')).searchParams.get('code'),
      code_verifier: verifier,
      redirect_uri: REDIRECT_URI,
    })
    response.assertStatus(200)
    assert.match(response.body().access_token, /^mcpat_/)
  })
})
