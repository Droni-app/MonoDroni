import { createHash } from 'node:crypto'
import { test } from '@japa/runner'
import limiter from '@adonisjs/limiter/services/main'
import mail from '@adonisjs/mail/services/main'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'
import Enrollment from '#models/enrollment'
import OauthClient from '#models/oauth/oauth_client'
import OauthGrant from '#models/oauth/oauth_grant'
import PasswordResetToken from '#models/password_reset_token'
import Site from '#models/site'
import User from '#models/user'

const REDIRECT_URI = 'https://client.example/callback'
const CSRF = 'test-csrf'
const PASSWORD = 'password123'
const NEW_PASSWORD = 'new-password-456'

let sentMails: ReturnType<typeof mail.fake>

function sent() {
  return sentMails.messages.sent().map((message: any) => message.toJSON())
}

function mailData(index = 0) {
  return (sent()[index].views as any).html.data
}

async function firstPartyClient() {
  const site = await Site.create({
    name: `Sitio ${crypto.randomUUID()}`,
    url: 'https://sitio.example',
  })
  const client = await OauthClient.create({
    id: crypto.randomUUID(),
    type: 'first_party',
    name: site.name,
    siteId: site.id,
    secretHash: 'x'.repeat(64),
    redirectUris: [REDIRECT_URI],
    grantTypes: ['authorization_code'],
    tokenEndpointAuthMethod: 'client_secret_post',
  })
  return { site, client, params: authorizeParams(client.id) }
}

async function connector() {
  const client = await OauthClient.create({
    id: crypto.randomUUID(),
    type: 'dynamic',
    name: 'Conector',
    redirectUris: [REDIRECT_URI],
    grantTypes: ['authorization_code', 'refresh_token'],
    tokenEndpointAuthMethod: 'none',
  })
  return { client, params: authorizeParams(client.id) }
}

function authorizeParams(clientId: string) {
  return new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    code_challenge: 'a'.repeat(43),
    code_challenge_method: 'S256',
  }).toString()
}

async function createUser(verified = true) {
  const user = await User.create({
    fullName: 'Tester',
    email: `${crypto.randomUUID()}@example.com`,
    password: PASSWORD,
  })
  if (verified) {
    user.emailVerifiedAt = DateTime.now()
    await user.save()
  }
  return user
}

const post = (client: any, path: string, form: Record<string, string>) =>
  client
    .post(path)
    .withSession({ 'oauth.csrf': CSRF })
    .form({ _csrf: CSRF, ...form })
    .redirects(0)

const signupForm = (params: string, email: string) => ({
  params,
  email,
  fullName: 'Persona Nueva',
  password: PASSWORD,
  passwordConfirmation: PASSWORD,
})

function resetTokenFromMail(index = 0) {
  return new URL(mailData(index).url).searchParams.get('token')!
}

test.group('OAuth account pages', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  group.each.setup(() => limiter.clear(['memory']))
  group.each.setup(() => {
    sentMails = mail.fake()
    return () => mail.restore()
  })

  test('signup creates the account, enrolls it in the site and sends the link', async ({
    client,
    assert,
  }: any) => {
    const { site, params } = await firstPartyClient()
    const email = `${crypto.randomUUID()}@example.com`

    const response = await post(client, '/oauth/signup', signupForm(params, email))
    response.assertStatus(200)
    assert.include(response.text(), 'Revisa tu correo')

    const user = await User.findByOrFail('email', email)
    assert.isNull(user.emailVerifiedAt)
    assert.isNotNull(
      await Enrollment.query().where('site_id', site.id).where('user_id', user.id).first()
    )
    assert.lengthOf(sent(), 1)
    assert.equal(mailData().site.name, site.name)
    assert.include(mailData().url, `/oauth/verify-email/${user.id}`)
  })

  test('a connector can sign up too, as a plain Droni account', async ({ client, assert }: any) => {
    const { params } = await connector()
    const email = `${crypto.randomUUID()}@example.com`

    const response = await post(client, '/oauth/signup', signupForm(params, email))
    response.assertStatus(200)

    assert.equal(mailData().site.name, 'Droni')
    const user = await User.findByOrFail('email', email)
    assert.isNull(await Enrollment.findBy('user_id', user.id))
  })

  test('signing up with a taken address looks the same and changes nothing', async ({
    client,
    assert,
  }: any) => {
    const { params } = await firstPartyClient()
    const verified = await createUser()
    const fresh = await post(
      client,
      '/oauth/signup',
      signupForm(params, `${crypto.randomUUID()}@example.com`)
    )
    const taken = await post(client, '/oauth/signup', {
      ...signupForm(params, verified.email),
      password: 'someone-else-1',
      passwordConfirmation: 'someone-else-1',
    })

    taken.assertStatus(fresh.status())
    const strip = (html: string) => html.replace(/value="[^"]*"/g, '')
    assert.equal(strip(taken.text()), strip(fresh.text()))
    assert.equal(mailData(1).title, 'Ya tienes una cuenta')
    assert.isNull(mailData(1).url)

    const login = await post(client, '/oauth/login', {
      params,
      email: verified.email,
      password: PASSWORD,
    })
    login.assertStatus(303)
  })

  test('signing up again with an unverified address resends the link', async ({
    client,
    assert,
  }: any) => {
    const { params } = await firstPartyClient()
    const pending = await createUser(false)

    await post(client, '/oauth/signup', signupForm(params, pending.email))
    assert.equal(mailData().title, 'Verifica tu correo')
  })

  test('invalid signup data is reported without creating anything', async ({
    client,
    assert,
  }: any) => {
    const { params } = await firstPartyClient()
    const email = `${crypto.randomUUID()}@example.com`

    const response = await post(client, '/oauth/signup', {
      ...signupForm(params, email),
      passwordConfirmation: 'different-1',
    })
    response.assertStatus(422)
    assert.include(response.text(), 'coincidir')
    assert.include(response.text(), email)
    assert.isNull(await User.findBy('email', email))
    assert.lengthOf(sent(), 0)
  })

  test('an account can log in only after following the link', async ({ client, assert }: any) => {
    const { site, params } = await firstPartyClient()
    const email = `${crypto.randomUUID()}@example.com`
    await post(client, '/oauth/signup', signupForm(params, email))

    const early = await post(client, '/oauth/login', { params, email, password: PASSWORD })
    early.assertStatus(200)
    assert.include(early.text(), 'Reenviar correo de verificación')

    const { pathname, search } = new URL(mailData().url)
    const verified = await client.get(`${pathname}${search}`)
    verified.assertStatus(200)
    assert.include(verified.text(), 'Correo verificado')
    assert.include(verified.text(), site.name)

    const login = await post(client, '/oauth/login', { params, email, password: PASSWORD })
    login.assertStatus(303)
  })

  test('a tampered verification link does nothing', async ({ client, assert }: any) => {
    const user = await createUser(false)

    const response = await client.get(`/oauth/verify-email/${user.id}?signature=forged`)
    response.assertStatus(400)
    await user.refresh()
    assert.isNull(user.emailVerifiedAt)
  })

  test('resending only sends to unverified accounts, and looks the same', async ({
    client,
    assert,
  }: any) => {
    const { params } = await firstPartyClient()
    const pending = await createUser(false)
    const verified = await createUser()

    const toPending = await post(client, '/oauth/resend-verification', {
      params,
      email: pending.email,
    })
    const toVerified = await post(client, '/oauth/resend-verification', {
      params,
      email: verified.email,
    })
    toPending.assertStatus(200)
    toVerified.assertStatus(200)
    assert.equal(toPending.text(), toVerified.text())
    assert.lengthOf(sent(), 1)
  })

  test('recovery answers the same for known and unknown addresses', async ({
    client,
    assert,
  }: any) => {
    const { params } = await firstPartyClient()
    const user = await createUser()

    const known = await post(client, '/oauth/forgot-password', { params, email: user.email })
    const unknown = await post(client, '/oauth/forgot-password', {
      params,
      email: `${crypto.randomUUID()}@example.com`,
    })
    known.assertStatus(200)
    unknown.assertStatus(200)
    assert.equal(known.text(), unknown.text())
    assert.lengthOf(sent(), 1)
  })

  test('the token is stored hashed and the page works from the link', async ({
    client,
    assert,
  }: any) => {
    const { site, params } = await firstPartyClient()
    const user = await createUser()
    await post(client, '/oauth/forgot-password', { params, email: user.email })

    const token = resetTokenFromMail()
    const row = await PasswordResetToken.findByOrFail('user_id', user.id)
    assert.notEqual(row.tokenHash, token)
    assert.equal(row.tokenHash, createHash('sha256').update(token).digest('hex'))

    const page = await client.get(`/oauth/reset-password?token=${encodeURIComponent(token)}`)
    page.assertStatus(200)
    assert.include(page.text(), site.name)
    assert.include(page.text(), 'name="passwordConfirmation"')
  })

  test('a reset changes the password and revokes everything issued before', async ({
    client,
    assert,
  }: any) => {
    const { client: oauthClient, params } = await firstPartyClient()
    const user = await createUser(false)
    const apiToken = await User.accessTokens.create(user)
    const grant = await OauthGrant.create({
      clientId: oauthClient.id,
      userId: user.id,
      resource: null,
      scope: 'mcp',
      accessTokenHash: 'a'.repeat(64),
      accessExpiresAt: DateTime.now().plus({ hours: 1 }),
    })
    await post(client, '/oauth/forgot-password', { params, email: user.email })

    const response = await post(client, '/oauth/reset-password', {
      token: resetTokenFromMail(),
      password: NEW_PASSWORD,
      passwordConfirmation: NEW_PASSWORD,
    })
    response.assertStatus(200)
    assert.include(response.text(), 'Contraseña actualizada')

    const rest = await client
      .get('/auth/sites')
      .header('authorization', `Bearer ${apiToken.value!.release()}`)
    rest.assertStatus(401)
    await grant.refresh()
    assert.isNotNull(grant.revokedAt)

    const oldLogin = await post(client, '/oauth/login', {
      params,
      email: user.email,
      password: PASSWORD,
    })
    oldLogin.assertStatus(200)
    const newLogin = await post(client, '/oauth/login', {
      params,
      email: user.email,
      password: NEW_PASSWORD,
    })
    // The link also proved the mailbox, so an unverified account gets activated
    newLogin.assertStatus(303)
  })

  test('a reset link works once, and neither an older nor an expired one works', async ({
    client,
  }: any) => {
    const { params } = await firstPartyClient()
    const user = await createUser()
    const change = (token: string) =>
      post(client, '/oauth/reset-password', {
        token,
        password: NEW_PASSWORD,
        passwordConfirmation: NEW_PASSWORD,
      })

    await post(client, '/oauth/forgot-password', { params, email: user.email })
    const older = resetTokenFromMail(0)
    await post(client, '/oauth/forgot-password', { params, email: user.email })
    const latest = resetTokenFromMail(1)

    const stale = await change(older)
    stale.assertStatus(400)

    await PasswordResetToken.query()
      .where('user_id', user.id)
      .update({ expires_at: DateTime.now().minus({ minutes: 1 }).toSQL({ includeOffset: false }) })
    const expired = await change(latest)
    expired.assertStatus(400)

    await PasswordResetToken.query()
      .where('user_id', user.id)
      .update({ expires_at: DateTime.now().plus({ hours: 1 }).toSQL({ includeOffset: false }) })
    const valid = await change(latest)
    valid.assertStatus(200)
    const replay = await change(latest)
    replay.assertStatus(400)
  })

  test('a weak new password is rejected and the link stays valid', async ({ client }: any) => {
    const { params } = await firstPartyClient()
    const user = await createUser()
    await post(client, '/oauth/forgot-password', { params, email: user.email })
    const token = resetTokenFromMail()

    const weak = await post(client, '/oauth/reset-password', {
      token,
      password: 'short',
      passwordConfirmation: 'short',
    })
    weak.assertStatus(422)
    const page = await client.get(`/oauth/reset-password?token=${encodeURIComponent(token)}`)
    page.assertStatus(200)
  })

  test('changing the password ends an open session in the consent page', async ({
    client,
    assert,
  }: any) => {
    const { params } = await connector()
    const user = await createUser()
    const stale = createHash('sha256').update('previous password hash').digest('hex')
    const current = createHash('sha256').update(user.password).digest('hex')
    const openPage = (credential: string) =>
      client
        .get(`/oauth/authorize?${params}`)
        .withGuard('web')
        .loginAs(user)
        .withSession({ oauth: { credential } })

    const valid = await openPage(current)
    assert.include(valid.text(), 'Autorizar acceso')
    const ended = await openPage(stale)
    assert.notInclude(ended.text(), 'Autorizar acceso')
    assert.include(ended.text(), 'name="password"')
  })

  test('a mailbox gets at most three emails an hour, without showing it', async ({
    client,
    assert,
  }: any) => {
    const { params } = await firstPartyClient()
    const user = await createUser()

    for (let attempt = 0; attempt < 5; attempt++) {
      const response = await post(client, '/oauth/forgot-password', { params, email: user.email })
      response.assertStatus(200)
    }
    assert.lengthOf(sent(), 3)
  })

  test('accounts can no longer be created through the REST API', async ({ client }: any) => {
    const site = await Site.create({ name: 'Sitio', url: 'https://sitio.example' })
    const user = await createUser(false)

    const register = await client
      .post('/auth/register')
      .header('x-site-id', site.id)
      .json(signupForm('', `${crypto.randomUUID()}@example.com`))
    register.assertStatus(404)
    const resend = await client
      .post('/auth/send-verification-email')
      .header('x-site-id', site.id)
      .json({ email: user.email })
    resend.assertStatus(404)
  })

  test('the forms need the csrf token', async ({ client, assert }: any) => {
    const { params } = await firstPartyClient()
    const email = `${crypto.randomUUID()}@example.com`

    const response = await client.post('/oauth/signup').form(signupForm(params, email))
    response.assertStatus(400)
    assert.isNull(await User.findBy('email', email))
  })

  test('the login page links to signup and recovery, keeping the flow', async ({
    client,
    assert,
  }: any) => {
    const { params } = await firstPartyClient()
    const page = await client.get(`/oauth/authorize?${params}`)
    assert.include(page.text(), '/oauth/signup?')
    assert.include(page.text(), '/oauth/forgot-password?')

    const signup = await client.get(`/oauth/signup?${params}`)
    signup.assertStatus(200)
    assert.include(signup.text(), 'Crea tu cuenta')
    const forgot = await client.get(`/oauth/forgot-password?${params}`)
    forgot.assertStatus(200)
    assert.include(forgot.text(), 'Recupera tu contraseña')
  })
})
