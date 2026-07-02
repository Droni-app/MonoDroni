/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  auth: {
    register: typeof routes['auth.register']
    sendVerificationEmail: typeof routes['auth.send_verification_email']
    validate: typeof routes['auth.validate']
    login: typeof routes['auth.login']
    getGoogleUrl: typeof routes['auth.get_google_url']
    handleCallback: typeof routes['auth.handle_callback']
    logout: typeof routes['auth.logout']
    me: typeof routes['auth.me']
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
  }
}
