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

// Store public + user routes
router
  .group(() => {
    // Public: product catalog
    router.resource('products', controllers.store.Products).only(['index', 'show'])

    // Authenticated: user's own addresses, orders, payments
    router.resource('addresses', controllers.store.Addresses).apiOnly().use('*', middleware.auth())
    router
      .resource('orders', controllers.store.Orders)
      .only(['index', 'store', 'show'])
      .use('*', middleware.auth())
    router
      .resource('payments', controllers.store.Payments)
      .only(['index', 'store', 'show'])
      .use('*', middleware.auth())
  })
  .prefix('store')
  .as('store')

// Learn public + course-role routes
router
  .group(() => {
    // Public: course catalog (active only)
    router.resource('courses', controllers.learn.Courses).only(['index', 'show'])

    // Lessons: public sees active lessons; teachers/admins (course role) see all and can manage
    router.resource('courses.lessons', controllers.learn.Lessons).only(['index', 'show'])
    router
      .resource('courses.lessons', controllers.learn.Lessons)
      .only(['store', 'update'])
      .use('*', middleware.auth())
      .use('*', middleware.courseRole({ roles: ['teacher', 'admin'] }))
    router
      .resource('courses.lessons', controllers.learn.Lessons)
      .only(['destroy'])
      .use('*', middleware.auth())
      .use('*', middleware.courseRole({ roles: ['admin'] }))

    // Question bank: teacher/admin only, no public access
    router
      .resource('courses.questions', controllers.learn.Questions)
      .only(['index', 'show', 'update'])
      .use('*', middleware.auth())
      .use('*', middleware.courseRole({ roles: ['teacher', 'admin'] }))
    router
      .resource('courses.questions', controllers.learn.Questions)
      .only(['store', 'destroy'])
      .use('*', middleware.auth())
      .use('*', middleware.courseRole({ roles: ['admin'] }))

    // Enrollments: any authenticated user can self-enroll when auto_enroll is on;
    // roster visibility is restricted to the course's teachers/admins
    router
      .resource('courses.enrollments', controllers.learn.Enrollments)
      .only(['store'])
      .use('*', middleware.auth())
    router
      .resource('courses.enrollments', controllers.learn.Enrollments)
      .only(['index', 'show'])
      .use('*', middleware.auth())
      .use('*', middleware.courseRole({ roles: ['teacher', 'admin'] }))

    // Lesson activity answers: students submit/see their own, teachers/admins review & grade
    router
      .resource('courses.lessons.answers', controllers.learn.Answers)
      .only(['store'])
      .use('*', middleware.auth())
      .use('*', middleware.courseRole({ roles: ['student'] }))
    router
      .resource('courses.lessons.answers', controllers.learn.Answers)
      .only(['show'])
      .use('*', middleware.auth())
      .use('*', middleware.courseRole({ roles: ['student', 'teacher', 'admin'] }))
    router
      .resource('courses.lessons.answers', controllers.learn.Answers)
      .only(['index', 'update'])
      .use('*', middleware.auth())
      .use('*', middleware.courseRole({ roles: ['teacher', 'admin'] }))
    router
      .resource('courses.lessons.answers', controllers.learn.Answers)
      .only(['destroy'])
      .use('*', middleware.auth())
      .use('*', middleware.courseRole({ roles: ['admin'] }))

    // Lesson quizzes: students submit/see their own attempts, teachers/admins review & grade
    router
      .resource('courses.lessons.quizzes', controllers.learn.Quizzes)
      .only(['store'])
      .use('*', middleware.auth())
      .use('*', middleware.courseRole({ roles: ['student'] }))
    router
      .resource('courses.lessons.quizzes', controllers.learn.Quizzes)
      .only(['show'])
      .use('*', middleware.auth())
      .use('*', middleware.courseRole({ roles: ['student', 'teacher', 'admin'] }))
    router
      .resource('courses.lessons.quizzes', controllers.learn.Quizzes)
      .only(['index', 'update'])
      .use('*', middleware.auth())
      .use('*', middleware.courseRole({ roles: ['teacher', 'admin'] }))
    router
      .resource('courses.lessons.quizzes', controllers.learn.Quizzes)
      .only(['destroy'])
      .use('*', middleware.auth())
      .use('*', middleware.courseRole({ roles: ['admin'] }))
  })
  .prefix('learn')
  .as('learn')

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
        router.resource('orders', controllers.admin.store.Orders).only(['index', 'show', 'update'])
        router
          .resource('payments', controllers.admin.store.Payments)
          .only(['index', 'show', 'update'])
        router.resource('coupons', controllers.admin.store.Coupons).apiOnly()
        router.resource('shipping-rules', controllers.admin.store.ShippingRules).apiOnly()
      })
      .prefix('store')
      .as('store')

    // Learn module
    router
      .group(() => {
        router.resource('courses', controllers.admin.learn.Courses).apiOnly()
        router.resource('courses.lessons', controllers.admin.learn.Lessons).apiOnly()
        router.resource('courses.questions', controllers.admin.learn.Questions).apiOnly()
        router
          .resource('courses.lessons.exam-questions', controllers.admin.learn.LessonExamQuestions)
          .only(['index', 'store', 'destroy'])
        router.resource('courses.lessons.answers', controllers.admin.learn.Answers).apiOnly()
        router
          .resource('courses.lessons.quizzes', controllers.admin.learn.Quizzes)
          .only(['index', 'show', 'update', 'destroy'])
        router.resource('enrollments', controllers.admin.learn.Enrollments).apiOnly()
        router.get('site-users', [controllers.admin.learn.SiteUsers, 'index'])
      })
      .prefix('learn')
      .as('learn')
  })
  .use(middleware.auth())
  .use(middleware.adminSite())
  .prefix('admin')
  .as('admin')
