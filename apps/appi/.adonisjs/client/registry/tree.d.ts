/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  auth: {
    validate: typeof routes['auth.validate']
    login: typeof routes['auth.login']
    getGoogleUrl: typeof routes['auth.get_google_url']
    handleCallback: typeof routes['auth.handle_callback']
    logout: typeof routes['auth.logout']
    me: typeof routes['auth.me']
    sites: typeof routes['auth.sites']
  }
  sites: {
    index: typeof routes['sites.index']
    show: typeof routes['sites.show']
  }
  content: {
    posts: {
      index: typeof routes['content.posts.index']
      show: typeof routes['content.posts.show']
    }
    attachments: {
      index: typeof routes['content.attachments.index']
      store: typeof routes['content.attachments.store']
      destroy: typeof routes['content.attachments.destroy']
    }
  }
  social: {
    comments: {
      index: typeof routes['social.comments.index']
      show: typeof routes['social.comments.show']
      store: typeof routes['social.comments.store']
      update: typeof routes['social.comments.update']
    }
    topics: {
      index: typeof routes['social.topics.index']
      show: typeof routes['social.topics.show']
      store: typeof routes['social.topics.store']
    }
    replies: {
      store: typeof routes['social.replies.store']
    }
  }
  store: {
    products: {
      index: typeof routes['store.products.index']
      show: typeof routes['store.products.show']
    }
    addresses: {
      index: typeof routes['store.addresses.index']
      store: typeof routes['store.addresses.store']
      show: typeof routes['store.addresses.show']
      update: typeof routes['store.addresses.update']
      destroy: typeof routes['store.addresses.destroy']
    }
    orders: {
      index: typeof routes['store.orders.index']
      store: typeof routes['store.orders.store']
      show: typeof routes['store.orders.show']
    }
    payments: {
      index: typeof routes['store.payments.index']
      store: typeof routes['store.payments.store']
      show: typeof routes['store.payments.show']
    }
  }
  learn: {
    courses: {
      index: typeof routes['learn.courses.index']
      show: typeof routes['learn.courses.show']
      lessons: {
        index: typeof routes['learn.courses.lessons.index']
        show: typeof routes['learn.courses.lessons.show']
        store: typeof routes['learn.courses.lessons.store']
        update: typeof routes['learn.courses.lessons.update']
        destroy: typeof routes['learn.courses.lessons.destroy']
        examQuestions: {
          index: typeof routes['learn.courses.lessons.exam_questions.index']
          store: typeof routes['learn.courses.lessons.exam_questions.store']
          destroy: typeof routes['learn.courses.lessons.exam_questions.destroy']
        }
        answers: {
          store: typeof routes['learn.courses.lessons.answers.store']
          show: typeof routes['learn.courses.lessons.answers.show']
          index: typeof routes['learn.courses.lessons.answers.index']
          update: typeof routes['learn.courses.lessons.answers.update']
          destroy: typeof routes['learn.courses.lessons.answers.destroy']
        }
        quizzes: {
          store: typeof routes['learn.courses.lessons.quizzes.store']
          show: typeof routes['learn.courses.lessons.quizzes.show']
          index: typeof routes['learn.courses.lessons.quizzes.index']
          update: typeof routes['learn.courses.lessons.quizzes.update']
          destroy: typeof routes['learn.courses.lessons.quizzes.destroy']
        }
      }
      questions: {
        index: typeof routes['learn.courses.questions.index']
        store: typeof routes['learn.courses.questions.store']
        show: typeof routes['learn.courses.questions.show']
        update: typeof routes['learn.courses.questions.update']
        destroy: typeof routes['learn.courses.questions.destroy']
      }
      enrollments: {
        store: typeof routes['learn.courses.enrollments.store']
        index: typeof routes['learn.courses.enrollments.index']
        show: typeof routes['learn.courses.enrollments.show']
      }
    }
    user: {
      courses: typeof routes['learn.user.courses']
      lessons: typeof routes['learn.user.lessons']
    }
  }
  mcp: {
    site: typeof routes['mcp.site'] & {
      notAllowed: typeof routes['mcp.site.not_allowed']
    }
    multiSite: typeof routes['mcp.multi_site'] & {
      notAllowed: typeof routes['mcp.multi_site.not_allowed']
    }
  }
  oauth: {
    metadata: {
      protectedResource: typeof routes['oauth.metadata.protected_resource']
      authorizationServer: typeof routes['oauth.metadata.authorization_server']
    }
    register: typeof routes['oauth.register']
    authorize: typeof routes['oauth.authorize'] & {
      decide: typeof routes['oauth.authorize.decide']
    }
    login: typeof routes['oauth.login']
    logout: typeof routes['oauth.logout']
    signup: typeof routes['oauth.signup'] & {
      store: typeof routes['oauth.signup.store']
    }
    resendVerification: typeof routes['oauth.resend_verification']
    verifyEmail: typeof routes['oauth.verify_email']
    forgotPassword: typeof routes['oauth.forgot_password'] & {
      store: typeof routes['oauth.forgot_password.store']
    }
    resetPassword: typeof routes['oauth.reset_password'] & {
      store: typeof routes['oauth.reset_password.store']
    }
    google: typeof routes['oauth.google'] & {
      callback: typeof routes['oauth.google.callback']
    }
    token: typeof routes['oauth.token']
    revoke: typeof routes['oauth.revoke']
  }
  admin: {
    content: {
      posts: {
        import: typeof routes['admin.content.posts.import']
        index: typeof routes['admin.content.posts.index']
        store: typeof routes['admin.content.posts.store']
        show: typeof routes['admin.content.posts.show']
        update: typeof routes['admin.content.posts.update']
        destroy: typeof routes['admin.content.posts.destroy']
        attributes: {
          index: typeof routes['admin.content.posts.attributes.index']
          store: typeof routes['admin.content.posts.attributes.store']
          destroy: typeof routes['admin.content.posts.attributes.destroy']
        }
      }
      attachments: {
        index: typeof routes['admin.content.attachments.index']
        store: typeof routes['admin.content.attachments.store']
        destroy: typeof routes['admin.content.attachments.destroy']
        import: typeof routes['admin.content.attachments.import']
      }
    }
    social: {
      comments: {
        index: typeof routes['admin.social.comments.index']
        show: typeof routes['admin.social.comments.show']
        update: typeof routes['admin.social.comments.update']
        destroy: typeof routes['admin.social.comments.destroy']
      }
      topics: {
        index: typeof routes['admin.social.topics.index']
        show: typeof routes['admin.social.topics.show']
        update: typeof routes['admin.social.topics.update']
        replies: {
          index: typeof routes['admin.social.topics.replies.index']
        }
      }
    }
    store: {
      products: {
        index: typeof routes['admin.store.products.index']
        store: typeof routes['admin.store.products.store']
        show: typeof routes['admin.store.products.show']
        update: typeof routes['admin.store.products.update']
        destroy: typeof routes['admin.store.products.destroy']
        attributes: {
          index: typeof routes['admin.store.products.attributes.index']
          store: typeof routes['admin.store.products.attributes.store']
          destroy: typeof routes['admin.store.products.attributes.destroy']
        }
      }
      orders: {
        index: typeof routes['admin.store.orders.index']
        show: typeof routes['admin.store.orders.show']
        update: typeof routes['admin.store.orders.update']
      }
      payments: {
        index: typeof routes['admin.store.payments.index']
        show: typeof routes['admin.store.payments.show']
        update: typeof routes['admin.store.payments.update']
      }
      coupons: {
        index: typeof routes['admin.store.coupons.index']
        store: typeof routes['admin.store.coupons.store']
        show: typeof routes['admin.store.coupons.show']
        update: typeof routes['admin.store.coupons.update']
        destroy: typeof routes['admin.store.coupons.destroy']
      }
      shippingRules: {
        index: typeof routes['admin.store.shipping_rules.index']
        store: typeof routes['admin.store.shipping_rules.store']
        show: typeof routes['admin.store.shipping_rules.show']
        update: typeof routes['admin.store.shipping_rules.update']
        destroy: typeof routes['admin.store.shipping_rules.destroy']
      }
    }
    learn: {
      courses: {
        index: typeof routes['admin.learn.courses.index']
        store: typeof routes['admin.learn.courses.store']
        show: typeof routes['admin.learn.courses.show']
        update: typeof routes['admin.learn.courses.update']
        destroy: typeof routes['admin.learn.courses.destroy']
        lessons: {
          index: typeof routes['admin.learn.courses.lessons.index']
          store: typeof routes['admin.learn.courses.lessons.store']
          show: typeof routes['admin.learn.courses.lessons.show']
          update: typeof routes['admin.learn.courses.lessons.update']
          destroy: typeof routes['admin.learn.courses.lessons.destroy']
          examQuestions: {
            index: typeof routes['admin.learn.courses.lessons.exam_questions.index']
            store: typeof routes['admin.learn.courses.lessons.exam_questions.store']
            destroy: typeof routes['admin.learn.courses.lessons.exam_questions.destroy']
          }
          answers: {
            index: typeof routes['admin.learn.courses.lessons.answers.index']
            store: typeof routes['admin.learn.courses.lessons.answers.store']
            show: typeof routes['admin.learn.courses.lessons.answers.show']
            update: typeof routes['admin.learn.courses.lessons.answers.update']
            destroy: typeof routes['admin.learn.courses.lessons.answers.destroy']
          }
          quizzes: {
            index: typeof routes['admin.learn.courses.lessons.quizzes.index']
            show: typeof routes['admin.learn.courses.lessons.quizzes.show']
            update: typeof routes['admin.learn.courses.lessons.quizzes.update']
            destroy: typeof routes['admin.learn.courses.lessons.quizzes.destroy']
          }
        }
        questions: {
          index: typeof routes['admin.learn.courses.questions.index']
          store: typeof routes['admin.learn.courses.questions.store']
          show: typeof routes['admin.learn.courses.questions.show']
          update: typeof routes['admin.learn.courses.questions.update']
          destroy: typeof routes['admin.learn.courses.questions.destroy']
        }
      }
      enrollments: {
        index: typeof routes['admin.learn.enrollments.index']
        store: typeof routes['admin.learn.enrollments.store']
        show: typeof routes['admin.learn.enrollments.show']
        update: typeof routes['admin.learn.enrollments.update']
        destroy: typeof routes['admin.learn.enrollments.destroy']
      }
      siteUsers: {
        index: typeof routes['admin.learn.site_users.index']
      }
    }
  }
}
