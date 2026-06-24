/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'auth.register': {
    methods: ["POST"],
    pattern: '/auth/register',
    tokens: [{"old":"/auth/register","type":0,"val":"auth","end":""},{"old":"/auth/register","type":0,"val":"register","end":""}],
    types: placeholder as Registry['auth.register']['types'],
  },
  'auth.send_verification_email': {
    methods: ["POST"],
    pattern: '/auth/send-verification-email',
    tokens: [{"old":"/auth/send-verification-email","type":0,"val":"auth","end":""},{"old":"/auth/send-verification-email","type":0,"val":"send-verification-email","end":""}],
    types: placeholder as Registry['auth.send_verification_email']['types'],
  },
  'auth.validate': {
    methods: ["GET","HEAD"],
    pattern: '/auth/verify-email/:enrollmentId',
    tokens: [{"old":"/auth/verify-email/:enrollmentId","type":0,"val":"auth","end":""},{"old":"/auth/verify-email/:enrollmentId","type":0,"val":"verify-email","end":""},{"old":"/auth/verify-email/:enrollmentId","type":1,"val":"enrollmentId","end":""}],
    types: placeholder as Registry['auth.validate']['types'],
  },
  'auth.login': {
    methods: ["POST"],
    pattern: '/auth/login',
    tokens: [{"old":"/auth/login","type":0,"val":"auth","end":""},{"old":"/auth/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['auth.login']['types'],
  },
  'auth.get_google_url': {
    methods: ["GET","HEAD"],
    pattern: '/auth/google/url',
    tokens: [{"old":"/auth/google/url","type":0,"val":"auth","end":""},{"old":"/auth/google/url","type":0,"val":"google","end":""},{"old":"/auth/google/url","type":0,"val":"url","end":""}],
    types: placeholder as Registry['auth.get_google_url']['types'],
  },
  'auth.handle_callback': {
    methods: ["GET","HEAD"],
    pattern: '/auth/google/handle',
    tokens: [{"old":"/auth/google/handle","type":0,"val":"auth","end":""},{"old":"/auth/google/handle","type":0,"val":"google","end":""},{"old":"/auth/google/handle","type":0,"val":"handle","end":""}],
    types: placeholder as Registry['auth.handle_callback']['types'],
  },
  'auth.logout': {
    methods: ["POST"],
    pattern: '/auth/logout',
    tokens: [{"old":"/auth/logout","type":0,"val":"auth","end":""},{"old":"/auth/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['auth.logout']['types'],
  },
  'auth.me': {
    methods: ["GET","HEAD"],
    pattern: '/auth/me',
    tokens: [{"old":"/auth/me","type":0,"val":"auth","end":""},{"old":"/auth/me","type":0,"val":"me","end":""}],
    types: placeholder as Registry['auth.me']['types'],
  },
  'sites.index': {
    methods: ["GET","HEAD"],
    pattern: '/sites',
    tokens: [{"old":"/sites","type":0,"val":"sites","end":""}],
    types: placeholder as Registry['sites.index']['types'],
  },
  'sites.show': {
    methods: ["GET","HEAD"],
    pattern: '/sites/:id',
    tokens: [{"old":"/sites/:id","type":0,"val":"sites","end":""},{"old":"/sites/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['sites.show']['types'],
  },
  'content.posts.index': {
    methods: ["GET","HEAD"],
    pattern: '/content/posts',
    tokens: [{"old":"/content/posts","type":0,"val":"content","end":""},{"old":"/content/posts","type":0,"val":"posts","end":""}],
    types: placeholder as Registry['content.posts.index']['types'],
  },
  'content.posts.show': {
    methods: ["GET","HEAD"],
    pattern: '/content/posts/:id',
    tokens: [{"old":"/content/posts/:id","type":0,"val":"content","end":""},{"old":"/content/posts/:id","type":0,"val":"posts","end":""},{"old":"/content/posts/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['content.posts.show']['types'],
  },
  'content.attachments.index': {
    methods: ["GET","HEAD"],
    pattern: '/content/attachments',
    tokens: [{"old":"/content/attachments","type":0,"val":"content","end":""},{"old":"/content/attachments","type":0,"val":"attachments","end":""}],
    types: placeholder as Registry['content.attachments.index']['types'],
  },
  'content.attachments.store': {
    methods: ["POST"],
    pattern: '/content/attachments',
    tokens: [{"old":"/content/attachments","type":0,"val":"content","end":""},{"old":"/content/attachments","type":0,"val":"attachments","end":""}],
    types: placeholder as Registry['content.attachments.store']['types'],
  },
  'content.attachments.destroy': {
    methods: ["DELETE"],
    pattern: '/content/attachments/:id',
    tokens: [{"old":"/content/attachments/:id","type":0,"val":"content","end":""},{"old":"/content/attachments/:id","type":0,"val":"attachments","end":""},{"old":"/content/attachments/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['content.attachments.destroy']['types'],
  },
  'social.comments.index': {
    methods: ["GET","HEAD"],
    pattern: '/social/comments',
    tokens: [{"old":"/social/comments","type":0,"val":"social","end":""},{"old":"/social/comments","type":0,"val":"comments","end":""}],
    types: placeholder as Registry['social.comments.index']['types'],
  },
  'social.comments.show': {
    methods: ["GET","HEAD"],
    pattern: '/social/comments/:id',
    tokens: [{"old":"/social/comments/:id","type":0,"val":"social","end":""},{"old":"/social/comments/:id","type":0,"val":"comments","end":""},{"old":"/social/comments/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['social.comments.show']['types'],
  },
  'social.comments.store': {
    methods: ["POST"],
    pattern: '/social/comments',
    tokens: [{"old":"/social/comments","type":0,"val":"social","end":""},{"old":"/social/comments","type":0,"val":"comments","end":""}],
    types: placeholder as Registry['social.comments.store']['types'],
  },
  'social.comments.update': {
    methods: ["PUT","PATCH"],
    pattern: '/social/comments/:id',
    tokens: [{"old":"/social/comments/:id","type":0,"val":"social","end":""},{"old":"/social/comments/:id","type":0,"val":"comments","end":""},{"old":"/social/comments/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['social.comments.update']['types'],
  },
  'social.topics.index': {
    methods: ["GET","HEAD"],
    pattern: '/social/topics',
    tokens: [{"old":"/social/topics","type":0,"val":"social","end":""},{"old":"/social/topics","type":0,"val":"topics","end":""}],
    types: placeholder as Registry['social.topics.index']['types'],
  },
  'social.topics.show': {
    methods: ["GET","HEAD"],
    pattern: '/social/topics/:id',
    tokens: [{"old":"/social/topics/:id","type":0,"val":"social","end":""},{"old":"/social/topics/:id","type":0,"val":"topics","end":""},{"old":"/social/topics/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['social.topics.show']['types'],
  },
  'social.topics.store': {
    methods: ["POST"],
    pattern: '/social/topics',
    tokens: [{"old":"/social/topics","type":0,"val":"social","end":""},{"old":"/social/topics","type":0,"val":"topics","end":""}],
    types: placeholder as Registry['social.topics.store']['types'],
  },
  'social.replies.store': {
    methods: ["POST"],
    pattern: '/social/topics/:topic_id/replies',
    tokens: [{"old":"/social/topics/:topic_id/replies","type":0,"val":"social","end":""},{"old":"/social/topics/:topic_id/replies","type":0,"val":"topics","end":""},{"old":"/social/topics/:topic_id/replies","type":1,"val":"topic_id","end":""},{"old":"/social/topics/:topic_id/replies","type":0,"val":"replies","end":""}],
    types: placeholder as Registry['social.replies.store']['types'],
  },
  'admin.content.posts.import': {
    methods: ["POST"],
    pattern: '/admin/content/posts/import',
    tokens: [{"old":"/admin/content/posts/import","type":0,"val":"admin","end":""},{"old":"/admin/content/posts/import","type":0,"val":"content","end":""},{"old":"/admin/content/posts/import","type":0,"val":"posts","end":""},{"old":"/admin/content/posts/import","type":0,"val":"import","end":""}],
    types: placeholder as Registry['admin.content.posts.import']['types'],
  },
  'admin.content.posts.index': {
    methods: ["GET","HEAD"],
    pattern: '/admin/content/posts',
    tokens: [{"old":"/admin/content/posts","type":0,"val":"admin","end":""},{"old":"/admin/content/posts","type":0,"val":"content","end":""},{"old":"/admin/content/posts","type":0,"val":"posts","end":""}],
    types: placeholder as Registry['admin.content.posts.index']['types'],
  },
  'admin.content.posts.store': {
    methods: ["POST"],
    pattern: '/admin/content/posts',
    tokens: [{"old":"/admin/content/posts","type":0,"val":"admin","end":""},{"old":"/admin/content/posts","type":0,"val":"content","end":""},{"old":"/admin/content/posts","type":0,"val":"posts","end":""}],
    types: placeholder as Registry['admin.content.posts.store']['types'],
  },
  'admin.content.posts.show': {
    methods: ["GET","HEAD"],
    pattern: '/admin/content/posts/:id',
    tokens: [{"old":"/admin/content/posts/:id","type":0,"val":"admin","end":""},{"old":"/admin/content/posts/:id","type":0,"val":"content","end":""},{"old":"/admin/content/posts/:id","type":0,"val":"posts","end":""},{"old":"/admin/content/posts/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.content.posts.show']['types'],
  },
  'admin.content.posts.update': {
    methods: ["PUT","PATCH"],
    pattern: '/admin/content/posts/:id',
    tokens: [{"old":"/admin/content/posts/:id","type":0,"val":"admin","end":""},{"old":"/admin/content/posts/:id","type":0,"val":"content","end":""},{"old":"/admin/content/posts/:id","type":0,"val":"posts","end":""},{"old":"/admin/content/posts/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.content.posts.update']['types'],
  },
  'admin.content.posts.destroy': {
    methods: ["DELETE"],
    pattern: '/admin/content/posts/:id',
    tokens: [{"old":"/admin/content/posts/:id","type":0,"val":"admin","end":""},{"old":"/admin/content/posts/:id","type":0,"val":"content","end":""},{"old":"/admin/content/posts/:id","type":0,"val":"posts","end":""},{"old":"/admin/content/posts/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.content.posts.destroy']['types'],
  },
  'admin.content.posts.attributes.index': {
    methods: ["GET","HEAD"],
    pattern: '/admin/content/posts/:post_id/attributes',
    tokens: [{"old":"/admin/content/posts/:post_id/attributes","type":0,"val":"admin","end":""},{"old":"/admin/content/posts/:post_id/attributes","type":0,"val":"content","end":""},{"old":"/admin/content/posts/:post_id/attributes","type":0,"val":"posts","end":""},{"old":"/admin/content/posts/:post_id/attributes","type":1,"val":"post_id","end":""},{"old":"/admin/content/posts/:post_id/attributes","type":0,"val":"attributes","end":""}],
    types: placeholder as Registry['admin.content.posts.attributes.index']['types'],
  },
  'admin.content.posts.attributes.store': {
    methods: ["POST"],
    pattern: '/admin/content/posts/:post_id/attributes',
    tokens: [{"old":"/admin/content/posts/:post_id/attributes","type":0,"val":"admin","end":""},{"old":"/admin/content/posts/:post_id/attributes","type":0,"val":"content","end":""},{"old":"/admin/content/posts/:post_id/attributes","type":0,"val":"posts","end":""},{"old":"/admin/content/posts/:post_id/attributes","type":1,"val":"post_id","end":""},{"old":"/admin/content/posts/:post_id/attributes","type":0,"val":"attributes","end":""}],
    types: placeholder as Registry['admin.content.posts.attributes.store']['types'],
  },
  'admin.content.posts.attributes.destroy': {
    methods: ["DELETE"],
    pattern: '/admin/content/posts/:post_id/attributes/:id',
    tokens: [{"old":"/admin/content/posts/:post_id/attributes/:id","type":0,"val":"admin","end":""},{"old":"/admin/content/posts/:post_id/attributes/:id","type":0,"val":"content","end":""},{"old":"/admin/content/posts/:post_id/attributes/:id","type":0,"val":"posts","end":""},{"old":"/admin/content/posts/:post_id/attributes/:id","type":1,"val":"post_id","end":""},{"old":"/admin/content/posts/:post_id/attributes/:id","type":0,"val":"attributes","end":""},{"old":"/admin/content/posts/:post_id/attributes/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.content.posts.attributes.destroy']['types'],
  },
  'admin.content.attachments.index': {
    methods: ["GET","HEAD"],
    pattern: '/admin/content/attachments',
    tokens: [{"old":"/admin/content/attachments","type":0,"val":"admin","end":""},{"old":"/admin/content/attachments","type":0,"val":"content","end":""},{"old":"/admin/content/attachments","type":0,"val":"attachments","end":""}],
    types: placeholder as Registry['admin.content.attachments.index']['types'],
  },
  'admin.content.attachments.store': {
    methods: ["POST"],
    pattern: '/admin/content/attachments',
    tokens: [{"old":"/admin/content/attachments","type":0,"val":"admin","end":""},{"old":"/admin/content/attachments","type":0,"val":"content","end":""},{"old":"/admin/content/attachments","type":0,"val":"attachments","end":""}],
    types: placeholder as Registry['admin.content.attachments.store']['types'],
  },
  'admin.content.attachments.destroy': {
    methods: ["DELETE"],
    pattern: '/admin/content/attachments/:id',
    tokens: [{"old":"/admin/content/attachments/:id","type":0,"val":"admin","end":""},{"old":"/admin/content/attachments/:id","type":0,"val":"content","end":""},{"old":"/admin/content/attachments/:id","type":0,"val":"attachments","end":""},{"old":"/admin/content/attachments/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.content.attachments.destroy']['types'],
  },
  'admin.content.attachments.import': {
    methods: ["GET","HEAD"],
    pattern: '/admin/content/attachments/import',
    tokens: [{"old":"/admin/content/attachments/import","type":0,"val":"admin","end":""},{"old":"/admin/content/attachments/import","type":0,"val":"content","end":""},{"old":"/admin/content/attachments/import","type":0,"val":"attachments","end":""},{"old":"/admin/content/attachments/import","type":0,"val":"import","end":""}],
    types: placeholder as Registry['admin.content.attachments.import']['types'],
  },
  'admin.social.comments.index': {
    methods: ["GET","HEAD"],
    pattern: '/admin/social/comments',
    tokens: [{"old":"/admin/social/comments","type":0,"val":"admin","end":""},{"old":"/admin/social/comments","type":0,"val":"social","end":""},{"old":"/admin/social/comments","type":0,"val":"comments","end":""}],
    types: placeholder as Registry['admin.social.comments.index']['types'],
  },
  'admin.social.comments.show': {
    methods: ["GET","HEAD"],
    pattern: '/admin/social/comments/:id',
    tokens: [{"old":"/admin/social/comments/:id","type":0,"val":"admin","end":""},{"old":"/admin/social/comments/:id","type":0,"val":"social","end":""},{"old":"/admin/social/comments/:id","type":0,"val":"comments","end":""},{"old":"/admin/social/comments/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.social.comments.show']['types'],
  },
  'admin.social.comments.update': {
    methods: ["PUT","PATCH"],
    pattern: '/admin/social/comments/:id',
    tokens: [{"old":"/admin/social/comments/:id","type":0,"val":"admin","end":""},{"old":"/admin/social/comments/:id","type":0,"val":"social","end":""},{"old":"/admin/social/comments/:id","type":0,"val":"comments","end":""},{"old":"/admin/social/comments/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.social.comments.update']['types'],
  },
  'admin.social.comments.destroy': {
    methods: ["DELETE"],
    pattern: '/admin/social/comments/:id',
    tokens: [{"old":"/admin/social/comments/:id","type":0,"val":"admin","end":""},{"old":"/admin/social/comments/:id","type":0,"val":"social","end":""},{"old":"/admin/social/comments/:id","type":0,"val":"comments","end":""},{"old":"/admin/social/comments/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.social.comments.destroy']['types'],
  },
  'admin.social.topics.index': {
    methods: ["GET","HEAD"],
    pattern: '/admin/social/topics',
    tokens: [{"old":"/admin/social/topics","type":0,"val":"admin","end":""},{"old":"/admin/social/topics","type":0,"val":"social","end":""},{"old":"/admin/social/topics","type":0,"val":"topics","end":""}],
    types: placeholder as Registry['admin.social.topics.index']['types'],
  },
  'admin.social.topics.show': {
    methods: ["GET","HEAD"],
    pattern: '/admin/social/topics/:id',
    tokens: [{"old":"/admin/social/topics/:id","type":0,"val":"admin","end":""},{"old":"/admin/social/topics/:id","type":0,"val":"social","end":""},{"old":"/admin/social/topics/:id","type":0,"val":"topics","end":""},{"old":"/admin/social/topics/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.social.topics.show']['types'],
  },
  'admin.social.topics.update': {
    methods: ["PUT","PATCH"],
    pattern: '/admin/social/topics/:id',
    tokens: [{"old":"/admin/social/topics/:id","type":0,"val":"admin","end":""},{"old":"/admin/social/topics/:id","type":0,"val":"social","end":""},{"old":"/admin/social/topics/:id","type":0,"val":"topics","end":""},{"old":"/admin/social/topics/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.social.topics.update']['types'],
  },
  'admin.social.topics.replies.index': {
    methods: ["GET","HEAD"],
    pattern: '/admin/social/topics/:topic_id/replies',
    tokens: [{"old":"/admin/social/topics/:topic_id/replies","type":0,"val":"admin","end":""},{"old":"/admin/social/topics/:topic_id/replies","type":0,"val":"social","end":""},{"old":"/admin/social/topics/:topic_id/replies","type":0,"val":"topics","end":""},{"old":"/admin/social/topics/:topic_id/replies","type":1,"val":"topic_id","end":""},{"old":"/admin/social/topics/:topic_id/replies","type":0,"val":"replies","end":""}],
    types: placeholder as Registry['admin.social.topics.replies.index']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
