/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import AutoSwagger from 'adonis-autoswagger'
import swagger from '#config/swagger'

router.get('/', () => {
  return { hello: 'world' }
})

router.get('/swagger', async () => {
  return AutoSwagger.default.docs(router.toJSON(), swagger)
})

router.get('/docs', async ({ response }) => {
  return response.send(AutoSwagger.default.ui('/swagger', swagger))
})

router.get('/201aae24c561528ec1542b94df7e1db9.txt', ({ response }) => {
  response.type('text/plain')
  return ''
})

// Public routes
router.post('auth/register', [controllers.Auth, 'register'])
router.post('auth/send-verification-email', [controllers.Auth, 'sendVerificationEmail'])
router.get('auth/verify-email/:enrollmentId', [controllers.Auth, 'verifyEmail']).as('auth.validate')
router.post('auth/login', [controllers.Auth, 'login'])
router.get('auth/google/url', [controllers.Auth, 'getGoogleUrl'])
router.get('auth/google/handle', [controllers.Auth, 'handleCallback'])
router.post('auth/logout', [controllers.Auth, 'logout'])
router.get('auth/me', [controllers.Auth, 'me'])
router.resource('sites', controllers.Sites).only(['index', 'show'])
router
  .group(() => {
    router.resource('posts', controllers.content.Posts).only(['index', 'show'])
    router
      .resource('attachments', controllers.content.Attachments)
      .only(['index', 'store', 'destroy'])
      .use('*', middleware.auth())
  })
  .prefix('content')
  .as('content')

router
  .group(() => {
    router.resource('comments', controllers.social.Comments).only(['index', 'show'])
    router
      .resource('comments', controllers.social.Comments)
      .only(['store', 'update'])
      .use('*', middleware.auth())
    router.resource('topics', controllers.social.Topics).only(['index', 'show'])
    router
      .resource('topics', controllers.social.Topics)
      .only(['store'])
      .use('*', middleware.auth())
      .use('*', middleware.enrolledUser())
    router
      .post('topics/:topic_id/replies', [controllers.social.Replies, 'store'])
      .use(middleware.auth())
      .use(middleware.enrolledUser())
  })
  .prefix('social')
  .as('social')

// Admin routes
router
  .group(() => {
    // Content module
    router
      .group(() => {
        router.post('posts/import', [controllers.admin.content.Posts, 'import'])
        router.resource('posts', controllers.admin.content.Posts).apiOnly()
        router
          .resource('posts.attributes', controllers.admin.content.PostAttributes)
          .only(['index', 'store', 'destroy'])
        router
          .resource('attachments', controllers.admin.content.Attachments)
          .only(['index', 'store', 'destroy'])
        router.get('attachments/import', [controllers.admin.content.Attachments, 'import'])
      })
      .prefix('content')
      .as('content')

    // Social module
    router
      .group(() => {
        router
          .resource('comments', controllers.admin.social.Comments)
          .only(['index', 'show', 'update', 'destroy'])
        router.resource('topics', controllers.admin.social.Topics).only(['index', 'show', 'update'])
        router.resource('topics.replies', controllers.admin.social.Replies).only(['index'])
      })
      .prefix('social')
      .as('social')

    // Store module
    router
      .group(() => {
        router.resource('products', controllers.admin.store.Products).apiOnly()
        router
          .resource('products.attributes', controllers.admin.store.ProductAttributes)
          .only(['index', 'store', 'destroy'])
        router
          .resource('orders', controllers.admin.store.Orders)
          .only(['index', 'show', 'update'])
        router
          .resource('payments', controllers.admin.store.Payments)
          .only(['index', 'show', 'update'])
        router.resource('coupons', controllers.admin.store.Coupons).apiOnly()
        router.resource('shipping-rules', controllers.admin.store.ShippingRules).apiOnly()
      })
      .prefix('store')
      .as('store')
  })
  .use(middleware.auth())
  .use(middleware.adminSite())
  .prefix('admin')
  .as('admin')
