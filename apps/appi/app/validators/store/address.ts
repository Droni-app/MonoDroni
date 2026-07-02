import vine from '@vinejs/vine'

export const storeAddressValidator = vine.create({
  city_id: vine.number().nullable().optional(),
  address_line1: vine.string(),
  address_line2: vine.string().nullable().optional(),
  postal_code: vine.string().nullable().optional(),
  phone: vine.string().nullable().optional(),
  comments: vine.string().nullable().optional(),
})

export const updateAddressValidator = vine.create({
  city_id: vine.number().nullable().optional(),
  address_line1: vine.string().optional(),
  address_line2: vine.string().nullable().optional(),
  postal_code: vine.string().nullable().optional(),
  phone: vine.string().nullable().optional(),
  comments: vine.string().nullable().optional(),
})
