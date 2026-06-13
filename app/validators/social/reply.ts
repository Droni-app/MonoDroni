import vine from '@vinejs/vine'

export const storeReplyValidator = vine.create({
  content: vine.string().minLength(1),
})
