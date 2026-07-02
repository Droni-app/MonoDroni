import vine from '@vinejs/vine'

export const storeProductAttributeValidator = vine.create({
  name: vine.string(),
  value: vine.string(),
})
