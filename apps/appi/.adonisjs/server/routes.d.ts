import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'auth.register': { paramsTuple?: []; params?: {} }
    'auth.send_verification_email': { paramsTuple?: []; params?: {} }
    'auth.validate': { paramsTuple: [ParamValue]; params: {'enrollmentId': ParamValue} }
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.get_google_url': { paramsTuple?: []; params?: {} }
    'auth.handle_callback': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'auth.me': { paramsTuple?: []; params?: {} }
    'sites.index': { paramsTuple?: []; params?: {} }
    'sites.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'content.posts.index': { paramsTuple?: []; params?: {} }
    'content.posts.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'content.attachments.index': { paramsTuple?: []; params?: {} }
    'content.attachments.store': { paramsTuple?: []; params?: {} }
    'content.attachments.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'social.comments.index': { paramsTuple?: []; params?: {} }
    'social.comments.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'social.comments.store': { paramsTuple?: []; params?: {} }
    'social.comments.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'social.topics.index': { paramsTuple?: []; params?: {} }
    'social.topics.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'social.topics.store': { paramsTuple?: []; params?: {} }
    'social.replies.store': { paramsTuple: [ParamValue]; params: {'topic_id': ParamValue} }
    'store.products.index': { paramsTuple?: []; params?: {} }
    'store.products.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'store.addresses.index': { paramsTuple?: []; params?: {} }
    'store.addresses.store': { paramsTuple?: []; params?: {} }
    'store.addresses.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'store.addresses.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'store.addresses.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'store.orders.index': { paramsTuple?: []; params?: {} }
    'store.orders.store': { paramsTuple?: []; params?: {} }
    'store.orders.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'store.payments.index': { paramsTuple?: []; params?: {} }
    'store.payments.store': { paramsTuple?: []; params?: {} }
    'store.payments.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'learn.courses.index': { paramsTuple?: []; params?: {} }
    'learn.courses.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'learn.courses.lessons.index': { paramsTuple: [ParamValue]; params: {'course_id': ParamValue} }
    'learn.courses.lessons.show': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'id': ParamValue} }
    'learn.courses.lessons.store': { paramsTuple: [ParamValue]; params: {'course_id': ParamValue} }
    'learn.courses.lessons.update': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'id': ParamValue} }
    'learn.courses.lessons.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'id': ParamValue} }
    'learn.courses.questions.index': { paramsTuple: [ParamValue]; params: {'course_id': ParamValue} }
    'learn.courses.questions.show': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'id': ParamValue} }
    'learn.courses.questions.update': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'id': ParamValue} }
    'learn.courses.questions.store': { paramsTuple: [ParamValue]; params: {'course_id': ParamValue} }
    'learn.courses.questions.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'id': ParamValue} }
    'learn.courses.enrollments.store': { paramsTuple: [ParamValue]; params: {'course_id': ParamValue} }
    'learn.courses.enrollments.index': { paramsTuple: [ParamValue]; params: {'course_id': ParamValue} }
    'learn.courses.enrollments.show': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'id': ParamValue} }
    'learn.courses.lessons.answers.store': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue} }
    'learn.courses.lessons.answers.show': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue,'id': ParamValue} }
    'learn.courses.lessons.answers.index': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue} }
    'learn.courses.lessons.answers.update': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue,'id': ParamValue} }
    'learn.courses.lessons.answers.destroy': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue,'id': ParamValue} }
    'learn.courses.lessons.quizzes.store': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue} }
    'learn.courses.lessons.quizzes.show': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue,'id': ParamValue} }
    'learn.courses.lessons.quizzes.index': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue} }
    'learn.courses.lessons.quizzes.update': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue,'id': ParamValue} }
    'learn.courses.lessons.quizzes.destroy': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue,'id': ParamValue} }
    'admin.content.posts.import': { paramsTuple?: []; params?: {} }
    'admin.content.posts.index': { paramsTuple?: []; params?: {} }
    'admin.content.posts.store': { paramsTuple?: []; params?: {} }
    'admin.content.posts.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.content.posts.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.content.posts.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.content.posts.attributes.index': { paramsTuple: [ParamValue]; params: {'post_id': ParamValue} }
    'admin.content.posts.attributes.store': { paramsTuple: [ParamValue]; params: {'post_id': ParamValue} }
    'admin.content.posts.attributes.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'post_id': ParamValue,'id': ParamValue} }
    'admin.content.attachments.index': { paramsTuple?: []; params?: {} }
    'admin.content.attachments.store': { paramsTuple?: []; params?: {} }
    'admin.content.attachments.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.content.attachments.import': { paramsTuple?: []; params?: {} }
    'admin.social.comments.index': { paramsTuple?: []; params?: {} }
    'admin.social.comments.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.social.comments.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.social.comments.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.social.topics.index': { paramsTuple?: []; params?: {} }
    'admin.social.topics.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.social.topics.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.social.topics.replies.index': { paramsTuple: [ParamValue]; params: {'topic_id': ParamValue} }
    'admin.store.products.index': { paramsTuple?: []; params?: {} }
    'admin.store.products.store': { paramsTuple?: []; params?: {} }
    'admin.store.products.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.store.products.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.store.products.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.store.products.attributes.index': { paramsTuple: [ParamValue]; params: {'product_id': ParamValue} }
    'admin.store.products.attributes.store': { paramsTuple: [ParamValue]; params: {'product_id': ParamValue} }
    'admin.store.products.attributes.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'product_id': ParamValue,'id': ParamValue} }
    'admin.store.orders.index': { paramsTuple?: []; params?: {} }
    'admin.store.orders.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.store.orders.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.store.payments.index': { paramsTuple?: []; params?: {} }
    'admin.store.payments.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.store.payments.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.store.coupons.index': { paramsTuple?: []; params?: {} }
    'admin.store.coupons.store': { paramsTuple?: []; params?: {} }
    'admin.store.coupons.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.store.coupons.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.store.coupons.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.store.shipping_rules.index': { paramsTuple?: []; params?: {} }
    'admin.store.shipping_rules.store': { paramsTuple?: []; params?: {} }
    'admin.store.shipping_rules.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.store.shipping_rules.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.store.shipping_rules.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.learn.courses.index': { paramsTuple?: []; params?: {} }
    'admin.learn.courses.store': { paramsTuple?: []; params?: {} }
    'admin.learn.courses.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.learn.courses.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.learn.courses.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.learn.courses.lessons.index': { paramsTuple: [ParamValue]; params: {'course_id': ParamValue} }
    'admin.learn.courses.lessons.store': { paramsTuple: [ParamValue]; params: {'course_id': ParamValue} }
    'admin.learn.courses.lessons.show': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'id': ParamValue} }
    'admin.learn.courses.lessons.update': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'id': ParamValue} }
    'admin.learn.courses.lessons.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'id': ParamValue} }
    'admin.learn.courses.questions.index': { paramsTuple: [ParamValue]; params: {'course_id': ParamValue} }
    'admin.learn.courses.questions.store': { paramsTuple: [ParamValue]; params: {'course_id': ParamValue} }
    'admin.learn.courses.questions.show': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'id': ParamValue} }
    'admin.learn.courses.questions.update': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'id': ParamValue} }
    'admin.learn.courses.questions.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'id': ParamValue} }
    'admin.learn.courses.lessons.exam_questions.index': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue} }
    'admin.learn.courses.lessons.exam_questions.store': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue} }
    'admin.learn.courses.lessons.exam_questions.destroy': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue,'id': ParamValue} }
    'admin.learn.courses.lessons.answers.index': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue} }
    'admin.learn.courses.lessons.answers.store': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue} }
    'admin.learn.courses.lessons.answers.show': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue,'id': ParamValue} }
    'admin.learn.courses.lessons.answers.update': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue,'id': ParamValue} }
    'admin.learn.courses.lessons.answers.destroy': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue,'id': ParamValue} }
    'admin.learn.courses.lessons.quizzes.index': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue} }
    'admin.learn.courses.lessons.quizzes.show': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue,'id': ParamValue} }
    'admin.learn.courses.lessons.quizzes.update': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue,'id': ParamValue} }
    'admin.learn.courses.lessons.quizzes.destroy': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue,'id': ParamValue} }
    'admin.learn.enrollments.index': { paramsTuple?: []; params?: {} }
    'admin.learn.enrollments.store': { paramsTuple?: []; params?: {} }
    'admin.learn.enrollments.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.learn.enrollments.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.learn.enrollments.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.learn.site_users.index': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'auth.validate': { paramsTuple: [ParamValue]; params: {'enrollmentId': ParamValue} }
    'auth.get_google_url': { paramsTuple?: []; params?: {} }
    'auth.handle_callback': { paramsTuple?: []; params?: {} }
    'auth.me': { paramsTuple?: []; params?: {} }
    'sites.index': { paramsTuple?: []; params?: {} }
    'sites.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'content.posts.index': { paramsTuple?: []; params?: {} }
    'content.posts.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'content.attachments.index': { paramsTuple?: []; params?: {} }
    'social.comments.index': { paramsTuple?: []; params?: {} }
    'social.comments.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'social.topics.index': { paramsTuple?: []; params?: {} }
    'social.topics.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'store.products.index': { paramsTuple?: []; params?: {} }
    'store.products.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'store.addresses.index': { paramsTuple?: []; params?: {} }
    'store.addresses.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'store.orders.index': { paramsTuple?: []; params?: {} }
    'store.orders.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'store.payments.index': { paramsTuple?: []; params?: {} }
    'store.payments.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'learn.courses.index': { paramsTuple?: []; params?: {} }
    'learn.courses.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'learn.courses.lessons.index': { paramsTuple: [ParamValue]; params: {'course_id': ParamValue} }
    'learn.courses.lessons.show': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'id': ParamValue} }
    'learn.courses.questions.index': { paramsTuple: [ParamValue]; params: {'course_id': ParamValue} }
    'learn.courses.questions.show': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'id': ParamValue} }
    'learn.courses.enrollments.index': { paramsTuple: [ParamValue]; params: {'course_id': ParamValue} }
    'learn.courses.enrollments.show': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'id': ParamValue} }
    'learn.courses.lessons.answers.show': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue,'id': ParamValue} }
    'learn.courses.lessons.answers.index': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue} }
    'learn.courses.lessons.quizzes.show': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue,'id': ParamValue} }
    'learn.courses.lessons.quizzes.index': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue} }
    'admin.content.posts.index': { paramsTuple?: []; params?: {} }
    'admin.content.posts.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.content.posts.attributes.index': { paramsTuple: [ParamValue]; params: {'post_id': ParamValue} }
    'admin.content.attachments.index': { paramsTuple?: []; params?: {} }
    'admin.content.attachments.import': { paramsTuple?: []; params?: {} }
    'admin.social.comments.index': { paramsTuple?: []; params?: {} }
    'admin.social.comments.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.social.topics.index': { paramsTuple?: []; params?: {} }
    'admin.social.topics.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.social.topics.replies.index': { paramsTuple: [ParamValue]; params: {'topic_id': ParamValue} }
    'admin.store.products.index': { paramsTuple?: []; params?: {} }
    'admin.store.products.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.store.products.attributes.index': { paramsTuple: [ParamValue]; params: {'product_id': ParamValue} }
    'admin.store.orders.index': { paramsTuple?: []; params?: {} }
    'admin.store.orders.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.store.payments.index': { paramsTuple?: []; params?: {} }
    'admin.store.payments.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.store.coupons.index': { paramsTuple?: []; params?: {} }
    'admin.store.coupons.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.store.shipping_rules.index': { paramsTuple?: []; params?: {} }
    'admin.store.shipping_rules.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.learn.courses.index': { paramsTuple?: []; params?: {} }
    'admin.learn.courses.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.learn.courses.lessons.index': { paramsTuple: [ParamValue]; params: {'course_id': ParamValue} }
    'admin.learn.courses.lessons.show': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'id': ParamValue} }
    'admin.learn.courses.questions.index': { paramsTuple: [ParamValue]; params: {'course_id': ParamValue} }
    'admin.learn.courses.questions.show': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'id': ParamValue} }
    'admin.learn.courses.lessons.exam_questions.index': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue} }
    'admin.learn.courses.lessons.answers.index': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue} }
    'admin.learn.courses.lessons.answers.show': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue,'id': ParamValue} }
    'admin.learn.courses.lessons.quizzes.index': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue} }
    'admin.learn.courses.lessons.quizzes.show': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue,'id': ParamValue} }
    'admin.learn.enrollments.index': { paramsTuple?: []; params?: {} }
    'admin.learn.enrollments.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.learn.site_users.index': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'auth.validate': { paramsTuple: [ParamValue]; params: {'enrollmentId': ParamValue} }
    'auth.get_google_url': { paramsTuple?: []; params?: {} }
    'auth.handle_callback': { paramsTuple?: []; params?: {} }
    'auth.me': { paramsTuple?: []; params?: {} }
    'sites.index': { paramsTuple?: []; params?: {} }
    'sites.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'content.posts.index': { paramsTuple?: []; params?: {} }
    'content.posts.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'content.attachments.index': { paramsTuple?: []; params?: {} }
    'social.comments.index': { paramsTuple?: []; params?: {} }
    'social.comments.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'social.topics.index': { paramsTuple?: []; params?: {} }
    'social.topics.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'store.products.index': { paramsTuple?: []; params?: {} }
    'store.products.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'store.addresses.index': { paramsTuple?: []; params?: {} }
    'store.addresses.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'store.orders.index': { paramsTuple?: []; params?: {} }
    'store.orders.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'store.payments.index': { paramsTuple?: []; params?: {} }
    'store.payments.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'learn.courses.index': { paramsTuple?: []; params?: {} }
    'learn.courses.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'learn.courses.lessons.index': { paramsTuple: [ParamValue]; params: {'course_id': ParamValue} }
    'learn.courses.lessons.show': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'id': ParamValue} }
    'learn.courses.questions.index': { paramsTuple: [ParamValue]; params: {'course_id': ParamValue} }
    'learn.courses.questions.show': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'id': ParamValue} }
    'learn.courses.enrollments.index': { paramsTuple: [ParamValue]; params: {'course_id': ParamValue} }
    'learn.courses.enrollments.show': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'id': ParamValue} }
    'learn.courses.lessons.answers.show': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue,'id': ParamValue} }
    'learn.courses.lessons.answers.index': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue} }
    'learn.courses.lessons.quizzes.show': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue,'id': ParamValue} }
    'learn.courses.lessons.quizzes.index': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue} }
    'admin.content.posts.index': { paramsTuple?: []; params?: {} }
    'admin.content.posts.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.content.posts.attributes.index': { paramsTuple: [ParamValue]; params: {'post_id': ParamValue} }
    'admin.content.attachments.index': { paramsTuple?: []; params?: {} }
    'admin.content.attachments.import': { paramsTuple?: []; params?: {} }
    'admin.social.comments.index': { paramsTuple?: []; params?: {} }
    'admin.social.comments.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.social.topics.index': { paramsTuple?: []; params?: {} }
    'admin.social.topics.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.social.topics.replies.index': { paramsTuple: [ParamValue]; params: {'topic_id': ParamValue} }
    'admin.store.products.index': { paramsTuple?: []; params?: {} }
    'admin.store.products.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.store.products.attributes.index': { paramsTuple: [ParamValue]; params: {'product_id': ParamValue} }
    'admin.store.orders.index': { paramsTuple?: []; params?: {} }
    'admin.store.orders.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.store.payments.index': { paramsTuple?: []; params?: {} }
    'admin.store.payments.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.store.coupons.index': { paramsTuple?: []; params?: {} }
    'admin.store.coupons.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.store.shipping_rules.index': { paramsTuple?: []; params?: {} }
    'admin.store.shipping_rules.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.learn.courses.index': { paramsTuple?: []; params?: {} }
    'admin.learn.courses.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.learn.courses.lessons.index': { paramsTuple: [ParamValue]; params: {'course_id': ParamValue} }
    'admin.learn.courses.lessons.show': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'id': ParamValue} }
    'admin.learn.courses.questions.index': { paramsTuple: [ParamValue]; params: {'course_id': ParamValue} }
    'admin.learn.courses.questions.show': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'id': ParamValue} }
    'admin.learn.courses.lessons.exam_questions.index': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue} }
    'admin.learn.courses.lessons.answers.index': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue} }
    'admin.learn.courses.lessons.answers.show': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue,'id': ParamValue} }
    'admin.learn.courses.lessons.quizzes.index': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue} }
    'admin.learn.courses.lessons.quizzes.show': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue,'id': ParamValue} }
    'admin.learn.enrollments.index': { paramsTuple?: []; params?: {} }
    'admin.learn.enrollments.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.learn.site_users.index': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'auth.register': { paramsTuple?: []; params?: {} }
    'auth.send_verification_email': { paramsTuple?: []; params?: {} }
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'content.attachments.store': { paramsTuple?: []; params?: {} }
    'social.comments.store': { paramsTuple?: []; params?: {} }
    'social.topics.store': { paramsTuple?: []; params?: {} }
    'social.replies.store': { paramsTuple: [ParamValue]; params: {'topic_id': ParamValue} }
    'store.addresses.store': { paramsTuple?: []; params?: {} }
    'store.orders.store': { paramsTuple?: []; params?: {} }
    'store.payments.store': { paramsTuple?: []; params?: {} }
    'learn.courses.lessons.store': { paramsTuple: [ParamValue]; params: {'course_id': ParamValue} }
    'learn.courses.questions.store': { paramsTuple: [ParamValue]; params: {'course_id': ParamValue} }
    'learn.courses.enrollments.store': { paramsTuple: [ParamValue]; params: {'course_id': ParamValue} }
    'learn.courses.lessons.answers.store': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue} }
    'learn.courses.lessons.quizzes.store': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue} }
    'admin.content.posts.import': { paramsTuple?: []; params?: {} }
    'admin.content.posts.store': { paramsTuple?: []; params?: {} }
    'admin.content.posts.attributes.store': { paramsTuple: [ParamValue]; params: {'post_id': ParamValue} }
    'admin.content.attachments.store': { paramsTuple?: []; params?: {} }
    'admin.store.products.store': { paramsTuple?: []; params?: {} }
    'admin.store.products.attributes.store': { paramsTuple: [ParamValue]; params: {'product_id': ParamValue} }
    'admin.store.coupons.store': { paramsTuple?: []; params?: {} }
    'admin.store.shipping_rules.store': { paramsTuple?: []; params?: {} }
    'admin.learn.courses.store': { paramsTuple?: []; params?: {} }
    'admin.learn.courses.lessons.store': { paramsTuple: [ParamValue]; params: {'course_id': ParamValue} }
    'admin.learn.courses.questions.store': { paramsTuple: [ParamValue]; params: {'course_id': ParamValue} }
    'admin.learn.courses.lessons.exam_questions.store': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue} }
    'admin.learn.courses.lessons.answers.store': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue} }
    'admin.learn.enrollments.store': { paramsTuple?: []; params?: {} }
  }
  DELETE: {
    'content.attachments.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'store.addresses.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'learn.courses.lessons.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'id': ParamValue} }
    'learn.courses.questions.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'id': ParamValue} }
    'learn.courses.lessons.answers.destroy': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue,'id': ParamValue} }
    'learn.courses.lessons.quizzes.destroy': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue,'id': ParamValue} }
    'admin.content.posts.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.content.posts.attributes.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'post_id': ParamValue,'id': ParamValue} }
    'admin.content.attachments.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.social.comments.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.store.products.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.store.products.attributes.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'product_id': ParamValue,'id': ParamValue} }
    'admin.store.coupons.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.store.shipping_rules.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.learn.courses.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.learn.courses.lessons.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'id': ParamValue} }
    'admin.learn.courses.questions.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'id': ParamValue} }
    'admin.learn.courses.lessons.exam_questions.destroy': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue,'id': ParamValue} }
    'admin.learn.courses.lessons.answers.destroy': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue,'id': ParamValue} }
    'admin.learn.courses.lessons.quizzes.destroy': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue,'id': ParamValue} }
    'admin.learn.enrollments.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PUT: {
    'social.comments.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'store.addresses.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'learn.courses.lessons.update': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'id': ParamValue} }
    'learn.courses.questions.update': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'id': ParamValue} }
    'learn.courses.lessons.answers.update': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue,'id': ParamValue} }
    'learn.courses.lessons.quizzes.update': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue,'id': ParamValue} }
    'admin.content.posts.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.social.comments.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.social.topics.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.store.products.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.store.orders.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.store.payments.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.store.coupons.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.store.shipping_rules.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.learn.courses.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.learn.courses.lessons.update': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'id': ParamValue} }
    'admin.learn.courses.questions.update': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'id': ParamValue} }
    'admin.learn.courses.lessons.answers.update': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue,'id': ParamValue} }
    'admin.learn.courses.lessons.quizzes.update': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue,'id': ParamValue} }
    'admin.learn.enrollments.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PATCH: {
    'social.comments.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'store.addresses.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'learn.courses.lessons.update': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'id': ParamValue} }
    'learn.courses.questions.update': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'id': ParamValue} }
    'learn.courses.lessons.answers.update': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue,'id': ParamValue} }
    'learn.courses.lessons.quizzes.update': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue,'id': ParamValue} }
    'admin.content.posts.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.social.comments.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.social.topics.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.store.products.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.store.orders.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.store.payments.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.store.coupons.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.store.shipping_rules.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.learn.courses.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.learn.courses.lessons.update': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'id': ParamValue} }
    'admin.learn.courses.questions.update': { paramsTuple: [ParamValue,ParamValue]; params: {'course_id': ParamValue,'id': ParamValue} }
    'admin.learn.courses.lessons.answers.update': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue,'id': ParamValue} }
    'admin.learn.courses.lessons.quizzes.update': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'course_id': ParamValue,'lesson_id': ParamValue,'id': ParamValue} }
    'admin.learn.enrollments.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}