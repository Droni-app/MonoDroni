import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { signedUrlFor } from '@adonisjs/core/services/url_builder'
import Enrollment from '#models/enrollment'
import Site from '#models/site'
import User from '#models/user'

test.group('Email verification', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('redirects to the site without the signature of the link', async ({ client, assert }) => {
    const site = await Site.create({ name: 'Sitio', url: 'https://sitio.example' })
    const user = await User.create({
      fullName: 'Tester',
      email: `${crypto.randomUUID()}@example.com`,
      password: 'password123',
    })
    const enrollment = await Enrollment.create({ siteId: site.id, userId: user.id, role: 'user' })
    const url = signedUrlFor(
      'auth.validate',
      { enrollmentId: enrollment.id },
      { expiresIn: '1 days' }
    )

    const response = await client.get(url).header('x-site-id', site.id).redirects(0)

    response.assertStatus(302)
    assert.equal(response.header('location'), 'https://sitio.example')
    await user.refresh()
    assert.isNotNull(user.emailVerifiedAt)
  })
})
