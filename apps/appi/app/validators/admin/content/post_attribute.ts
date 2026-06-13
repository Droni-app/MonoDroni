import vine from '@vinejs/vine'

export const storePostAttributeValidator = vine.create({
  name: vine.string(),
  type: vine.string().optional(),
  value: vine.string(),
})
