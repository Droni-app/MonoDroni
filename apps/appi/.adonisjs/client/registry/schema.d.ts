/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'auth.register': {
    methods: ["POST"]
    pattern: '/auth/register'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').signupValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').signupValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['register']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['register']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.send_verification_email': {
    methods: ["POST"]
    pattern: '/auth/send-verification-email'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').sendVerificationEmailValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').sendVerificationEmailValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['sendVerificationEmail']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['sendVerificationEmail']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.validate': {
    methods: ["GET","HEAD"]
    pattern: '/auth/verify-email/:enrollmentId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { enrollmentId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['verifyEmail']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['verifyEmail']>>>
    }
  }
  'auth.login': {
    methods: ["POST"]
    pattern: '/auth/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').loginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').loginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['login']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['login']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.get_google_url': {
    methods: ["GET","HEAD"]
    pattern: '/auth/google/url'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['getGoogleUrl']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['getGoogleUrl']>>>
    }
  }
  'auth.handle_callback': {
    methods: ["GET","HEAD"]
    pattern: '/auth/google/handle'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['handleCallback']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['handleCallback']>>>
    }
  }
  'auth.logout': {
    methods: ["POST"]
    pattern: '/auth/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['logout']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['logout']>>>
    }
  }
  'auth.me': {
    methods: ["GET","HEAD"]
    pattern: '/auth/me'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['me']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['me']>>>
    }
  }
  'sites.index': {
    methods: ["GET","HEAD"]
    pattern: '/sites'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/sites_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/sites_controller').default['index']>>>
    }
  }
  'sites.show': {
    methods: ["GET","HEAD"]
    pattern: '/sites/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/sites_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/sites_controller').default['show']>>>
    }
  }
  'content.posts.index': {
    methods: ["GET","HEAD"]
    pattern: '/content/posts'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/content/posts_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/content/posts_controller').default['index']>>>
    }
  }
  'content.posts.show': {
    methods: ["GET","HEAD"]
    pattern: '/content/posts/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/content/posts_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/content/posts_controller').default['show']>>>
    }
  }
  'content.attachments.index': {
    methods: ["GET","HEAD"]
    pattern: '/content/attachments'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/content/attachments_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/content/attachments_controller').default['index']>>>
    }
  }
  'content.attachments.store': {
    methods: ["POST"]
    pattern: '/content/attachments'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin/content/attachment').storeAttachmentValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/admin/content/attachment').storeAttachmentValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/content/attachments_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/content/attachments_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'content.attachments.destroy': {
    methods: ["DELETE"]
    pattern: '/content/attachments/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/content/attachments_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/content/attachments_controller').default['destroy']>>>
    }
  }
  'social.comments.index': {
    methods: ["GET","HEAD"]
    pattern: '/social/comments'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/social/comment').indexCommentValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/social/comments_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/social/comments_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'social.comments.show': {
    methods: ["GET","HEAD"]
    pattern: '/social/comments/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/social/comments_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/social/comments_controller').default['show']>>>
    }
  }
  'social.comments.store': {
    methods: ["POST"]
    pattern: '/social/comments'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/social/comment').storeCommentValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/social/comment').storeCommentValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/social/comments_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/social/comments_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'social.comments.update': {
    methods: ["PUT","PATCH"]
    pattern: '/social/comments/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/social/comment').updateCommentValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/social/comment').updateCommentValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/social/comments_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/social/comments_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'social.topics.index': {
    methods: ["GET","HEAD"]
    pattern: '/social/topics'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/social/topics_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/social/topics_controller').default['index']>>>
    }
  }
  'social.topics.show': {
    methods: ["GET","HEAD"]
    pattern: '/social/topics/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/social/topics_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/social/topics_controller').default['show']>>>
    }
  }
  'social.topics.store': {
    methods: ["POST"]
    pattern: '/social/topics'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/social/topic').storeTopicValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/social/topic').storeTopicValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/social/topics_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/social/topics_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'social.replies.store': {
    methods: ["POST"]
    pattern: '/social/topics/:topic_id/replies'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/social/reply').storeReplyValidator)>>
      paramsTuple: [ParamValue]
      params: { topic_id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/social/reply').storeReplyValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/social/replies_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/social/replies_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.content.posts.import': {
    methods: ["POST"]
    pattern: '/admin/content/posts/import'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/content/posts_controller').default['import']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/content/posts_controller').default['import']>>>
    }
  }
  'admin.content.posts.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/content/posts'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/content/posts_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/content/posts_controller').default['index']>>>
    }
  }
  'admin.content.posts.store': {
    methods: ["POST"]
    pattern: '/admin/content/posts'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin/content/post').storePostValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/admin/content/post').storePostValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/content/posts_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/content/posts_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.content.posts.show': {
    methods: ["GET","HEAD"]
    pattern: '/admin/content/posts/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/content/posts_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/content/posts_controller').default['show']>>>
    }
  }
  'admin.content.posts.update': {
    methods: ["PUT","PATCH"]
    pattern: '/admin/content/posts/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin/content/post').updatePostValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin/content/post').updatePostValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/content/posts_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/content/posts_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.content.posts.destroy': {
    methods: ["DELETE"]
    pattern: '/admin/content/posts/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/content/posts_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/content/posts_controller').default['destroy']>>>
    }
  }
  'admin.content.posts.attributes.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/content/posts/:post_id/attributes'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { post_id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/content/post_attributes_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/content/post_attributes_controller').default['index']>>>
    }
  }
  'admin.content.posts.attributes.store': {
    methods: ["POST"]
    pattern: '/admin/content/posts/:post_id/attributes'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin/content/post_attribute').storePostAttributeValidator)>>
      paramsTuple: [ParamValue]
      params: { post_id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin/content/post_attribute').storePostAttributeValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/content/post_attributes_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/content/post_attributes_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.content.posts.attributes.destroy': {
    methods: ["DELETE"]
    pattern: '/admin/content/posts/:post_id/attributes/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { post_id: ParamValue; id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/content/post_attributes_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/content/post_attributes_controller').default['destroy']>>>
    }
  }
  'admin.content.attachments.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/content/attachments'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/content/attachments_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/content/attachments_controller').default['index']>>>
    }
  }
  'admin.content.attachments.store': {
    methods: ["POST"]
    pattern: '/admin/content/attachments'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin/content/attachment').storeAttachmentValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/admin/content/attachment').storeAttachmentValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/content/attachments_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/content/attachments_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.content.attachments.destroy': {
    methods: ["DELETE"]
    pattern: '/admin/content/attachments/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/content/attachments_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/content/attachments_controller').default['destroy']>>>
    }
  }
  'admin.content.attachments.import': {
    methods: ["GET","HEAD"]
    pattern: '/admin/content/attachments/import'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/content/attachments_controller').default['import']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/content/attachments_controller').default['import']>>>
    }
  }
  'admin.social.comments.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/social/comments'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/social/comments_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/social/comments_controller').default['index']>>>
    }
  }
  'admin.social.comments.show': {
    methods: ["GET","HEAD"]
    pattern: '/admin/social/comments/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/social/comments_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/social/comments_controller').default['show']>>>
    }
  }
  'admin.social.comments.update': {
    methods: ["PUT","PATCH"]
    pattern: '/admin/social/comments/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin/social/comment').updateCommentValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin/social/comment').updateCommentValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/social/comments_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/social/comments_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.social.comments.destroy': {
    methods: ["DELETE"]
    pattern: '/admin/social/comments/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/social/comments_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/social/comments_controller').default['destroy']>>>
    }
  }
  'admin.social.topics.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/social/topics'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/social/topics_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/social/topics_controller').default['index']>>>
    }
  }
  'admin.social.topics.show': {
    methods: ["GET","HEAD"]
    pattern: '/admin/social/topics/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/social/topics_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/social/topics_controller').default['show']>>>
    }
  }
  'admin.social.topics.update': {
    methods: ["PUT","PATCH"]
    pattern: '/admin/social/topics/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin/social/topic').updateTopicValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin/social/topic').updateTopicValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/social/topics_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/social/topics_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.social.topics.replies.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/social/topics/:topic_id/replies'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { topic_id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/social/replies_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/social/replies_controller').default['index']>>>
    }
  }
  'admin.store.products.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/store/products'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/store/products_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/store/products_controller').default['index']>>>
    }
  }
  'admin.store.products.store': {
    methods: ["POST"]
    pattern: '/admin/store/products'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin/store/product').storeProductValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/admin/store/product').storeProductValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/store/products_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/store/products_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.store.products.show': {
    methods: ["GET","HEAD"]
    pattern: '/admin/store/products/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/store/products_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/store/products_controller').default['show']>>>
    }
  }
  'admin.store.products.update': {
    methods: ["PUT","PATCH"]
    pattern: '/admin/store/products/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin/store/product').updateProductValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin/store/product').updateProductValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/store/products_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/store/products_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.store.products.destroy': {
    methods: ["DELETE"]
    pattern: '/admin/store/products/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/store/products_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/store/products_controller').default['destroy']>>>
    }
  }
  'admin.store.products.attributes.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/store/products/:product_id/attributes'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { product_id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/store/product_attributes_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/store/product_attributes_controller').default['index']>>>
    }
  }
  'admin.store.products.attributes.store': {
    methods: ["POST"]
    pattern: '/admin/store/products/:product_id/attributes'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin/store/product_attribute').storeProductAttributeValidator)>>
      paramsTuple: [ParamValue]
      params: { product_id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin/store/product_attribute').storeProductAttributeValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/store/product_attributes_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/store/product_attributes_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.store.products.attributes.destroy': {
    methods: ["DELETE"]
    pattern: '/admin/store/products/:product_id/attributes/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { product_id: ParamValue; id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/store/product_attributes_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/store/product_attributes_controller').default['destroy']>>>
    }
  }
  'admin.store.orders.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/store/orders'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/store/orders_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/store/orders_controller').default['index']>>>
    }
  }
  'admin.store.orders.show': {
    methods: ["GET","HEAD"]
    pattern: '/admin/store/orders/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/store/orders_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/store/orders_controller').default['show']>>>
    }
  }
  'admin.store.orders.update': {
    methods: ["PUT","PATCH"]
    pattern: '/admin/store/orders/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin/store/order').updateOrderValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin/store/order').updateOrderValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/store/orders_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/store/orders_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.store.payments.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/store/payments'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/store/payments_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/store/payments_controller').default['index']>>>
    }
  }
  'admin.store.payments.show': {
    methods: ["GET","HEAD"]
    pattern: '/admin/store/payments/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/store/payments_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/store/payments_controller').default['show']>>>
    }
  }
  'admin.store.payments.update': {
    methods: ["PUT","PATCH"]
    pattern: '/admin/store/payments/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin/store/payment').updatePaymentValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin/store/payment').updatePaymentValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/store/payments_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/store/payments_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.store.coupons.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/store/coupons'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/store/coupons_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/store/coupons_controller').default['index']>>>
    }
  }
  'admin.store.coupons.store': {
    methods: ["POST"]
    pattern: '/admin/store/coupons'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin/store/coupon').storeCouponValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/admin/store/coupon').storeCouponValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/store/coupons_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/store/coupons_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.store.coupons.show': {
    methods: ["GET","HEAD"]
    pattern: '/admin/store/coupons/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/store/coupons_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/store/coupons_controller').default['show']>>>
    }
  }
  'admin.store.coupons.update': {
    methods: ["PUT","PATCH"]
    pattern: '/admin/store/coupons/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin/store/coupon').updateCouponValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin/store/coupon').updateCouponValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/store/coupons_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/store/coupons_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.store.coupons.destroy': {
    methods: ["DELETE"]
    pattern: '/admin/store/coupons/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/store/coupons_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/store/coupons_controller').default['destroy']>>>
    }
  }
  'admin.store.shipping_rules.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/store/shipping-rules'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/store/shipping_rules_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/store/shipping_rules_controller').default['index']>>>
    }
  }
  'admin.store.shipping_rules.store': {
    methods: ["POST"]
    pattern: '/admin/store/shipping-rules'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin/store/shipping_rule').storeShippingRuleValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/admin/store/shipping_rule').storeShippingRuleValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/store/shipping_rules_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/store/shipping_rules_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.store.shipping_rules.show': {
    methods: ["GET","HEAD"]
    pattern: '/admin/store/shipping-rules/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/store/shipping_rules_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/store/shipping_rules_controller').default['show']>>>
    }
  }
  'admin.store.shipping_rules.update': {
    methods: ["PUT","PATCH"]
    pattern: '/admin/store/shipping-rules/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin/store/shipping_rule').updateShippingRuleValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin/store/shipping_rule').updateShippingRuleValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/store/shipping_rules_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/store/shipping_rules_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.store.shipping_rules.destroy': {
    methods: ["DELETE"]
    pattern: '/admin/store/shipping-rules/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/store/shipping_rules_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/store/shipping_rules_controller').default['destroy']>>>
    }
  }
}
