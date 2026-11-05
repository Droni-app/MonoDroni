import { test } from '@japa/runner'
import limiter from '@adonisjs/limiter/services/main'
import mail from '@adonisjs/mail/services/main'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'
import OauthClient from '#models/oauth/oauth_client'
import Site from '#models/site'
import User from '#models/user'
import env from '#start/env'

const PASSWORD = 'password123'
const CSRF = 'test-csrf'

async function createUser() {
  const user = await User.create({
    fullName: 'Tester',
    email: `${crypto.randomUUID()}@example.com`,
    password: PASSWORD,
  })
  user.emailVerifiedAt = DateTime.now()
  await user.save()
  return user
}

test.group('Rate limits', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  group.each.setup(() => limiter.clear(['memory']))
  group.each.setup(() => {
    mail.fake()
    return () => mail.restore()
  })

  const site = () => Site.create({ name: 'Sitio', url: 'https://sitio.example' })

  const restLogin = (client: any, siteId: string, email: string, password: string) =>
    client.post('/auth/login').header('x-site-id', siteId).json({ email, password })

  test('five failed logins block the account from that IP, even with the right password', async ({
    client,
  }: any) => {
    const { id } = await site()
    const user = await createUser()

    for (let attempt = 0; attempt < 5; attempt++) {
      const response = await restLogin(client, id, user.email, 'wrong-password')
      response.assertStatus(400)
    }

    const blocked = await restLogin(client, id, user.email, PASSWORD)
    blocked.assertStatus(429)
    blocked.assertHeader('retry-after')
  })

  test('another account from the same IP can still log in', async ({ client }: any) => {
    const { id } = await site()
    const victim = await createUser()
    const other = await createUser()

    for (let attempt = 0; attempt < 5; attempt++) {
      await restLogin(client, id, victim.email, 'wrong-password')
    }

    const response = await restLogin(client, id, other.email, PASSWORD)
    response.assertStatus(200)
  })

  test('a successful login resets the account but not the IP', async ({ client }: any) => {
    const { id } = await site()
    const own = await createUser()

    // 30 failures per IP, spread out so that no single account gets blocked first
    for (let attempt = 0; attempt < 30; attempt++) {
      await restLogin(client, id, `guess-${attempt}@example.com`, 'wrong-password')
      if (attempt === 3) {
        const login = await restLogin(client, id, own.email, PASSWORD)
        login.assertStatus(200)
      }
    }

    const blocked = await restLogin(client, id, own.email, PASSWORD)
    blocked.assertStatus(429)
  })

  test('successful logins do not count', async ({ client }: any) => {
    const { id } = await site()
    const user = await createUser()

    for (let attempt = 0; attempt < 8; attempt++) {
      const response = await restLogin(client, id, user.email, PASSWORD)
      response.assertStatus(200)
    }
  })

  test('the OAuth login page shows the block in its own form', async ({ client, assert }: any) => {
    const user = await createUser()
    const oauthClient = await OauthClient.create({
      id: crypto.randomUUID(),
      type: 'dynamic',
      name: 'Test client',
      redirectUris: ['https://client.example/callback'],
      grantTypes: ['authorization_code'],
      tokenEndpointAuthMethod: 'none',
    })
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: oauthClient.id,
      redirect_uri: 'https://client.example/callback',
      code_challenge: 'a'.repeat(43),
      code_challenge_method: 'S256',
    }).toString()
    const login = (password: string) =>
      client
        .post('/oauth/login')
        .withSession({ 'oauth.csrf': CSRF })
        .form({ _csrf: CSRF, params, email: user.email, password })
        .redirects(0)

    for (let attempt = 0; attempt < 5; attempt++) {
      const failed = await login('wrong-password')
      failed.assertStatus(200)
    }

    const blocked = await login(PASSWORD)
    blocked.assertStatus(429)
    blocked.assertHeader('retry-after')
    assert.include(blocked.text(), 'Demasiados intentos')
    assert.include(blocked.text(), 'name="password"')
  })

  test('client registration is limited per IP', async ({ client }: any) => {
    const register = () =>
      client.post('/oauth/register').json({
        client_name: 'Test',
        redirect_uris: ['https://client.example/callback'],
        token_endpoint_auth_method: 'none',
      })

    for (let attempt = 0; attempt < 30; attempt++) {
      const response = await register()
      response.assertStatus(201)
    }

    const blocked = await register()
    blocked.assertStatus(429)
  })

  test('with CLIENT_IP_HEADER, each client has its own limit', async ({ client, cleanup }: any) => {
    env.set('CLIENT_IP_HEADER', 'do-connecting-ip')
    cleanup(() => env.set('CLIENT_IP_HEADER', ''))
    const { id } = await site()
    const user = await createUser()
    const from = (ip: string, password: string) =>
      client
        .post('/auth/login')
        .header('x-site-id', id)
        .header('do-connecting-ip', ip)
        .json({ email: user.email, password })

    for (let attempt = 0; attempt < 5; attempt++) {
      await from('203.0.113.1', 'wrong-password')
    }

    const blocked = await from('203.0.113.1', PASSWORD)
    blocked.assertStatus(429)
    const other = await from('203.0.113.2', PASSWORD)
    other.assertStatus(200)
  })
})
