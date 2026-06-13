import vine from '@vinejs/vine'

export const updateTopicValidator = vine.create({
  name: vine.string().trim().minLength(3).optional(),
  content: vine.string().trim().minLength(1).optional(),
  active: vine.boolean().optional(),
})
