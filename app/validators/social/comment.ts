import vine from '@vinejs/vine'

export const COMMENTABLE_TYPES = ['ContentPost'] as const

export const indexCommentValidator = vine.create({
  commentable_type: vine.enum(COMMENTABLE_TYPES),
  commentable_id: vine.string().uuid(),
  page: vine.number().optional(),
  per_page: vine.number().optional(),
})
export const storeCommentValidator = vine.create({
  commentable_type: vine.enum(COMMENTABLE_TYPES),
  commentable_id: vine.string().uuid(),
  parent_id: vine.string().uuid().nullable().optional(),
  content: vine.string().minLength(1),
})

export const updateCommentValidator = vine.create({
  content: vine.string().minLength(1),
})
