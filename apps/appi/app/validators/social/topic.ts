import vine from '@vinejs/vine'

export const storeTopicValidator = vine.create({
  name: vine.string().minLength(1),
  content: vine.string().minLength(1),
  group: vine.string().optional(),
})
