import vine from '@vinejs/vine'

export const updateCommentValidator = vine.create({
  active: vine.boolean(),
})
