import ContentPost from '#models/content/post'
import type { COMMENTABLE_TYPES } from '#validators/social/comment'
import type { LucidModel } from '@adonisjs/lucid/types/model'

type CommentableType = (typeof COMMENTABLE_TYPES)[number]

const registry: Record<CommentableType, LucidModel> = {
  ContentPost: ContentPost,
}

export async function resolveCommentable(type: CommentableType, id: string, siteId: string) {
  const Model = registry[type]
  console.log('Resolving commentable:', { type, id, siteId })
  return (Model as any).query().where('site_id', siteId).andWhere('id', id).firstOrFail()
}
