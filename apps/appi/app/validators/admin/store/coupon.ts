import vine from '@vinejs/vine'

export const storeCouponValidator = vine.create({
  code: vine.string().toUpperCase(),
  discount: vine.number().min(0),
  discount_type: vine.enum(['percentage', 'fixed']),
  minimum_order_value: vine.number().min(0).nullable().optional(),
  expiration_date: vine.string().nullable().optional(),
  active: vine.boolean().optional(),
})

export const updateCouponValidator = vine.create({
  code: vine.string().toUpperCase().optional(),
  discount: vine.number().min(0).optional(),
  discount_type: vine.enum(['percentage', 'fixed']).optional(),
  minimum_order_value: vine.number().min(0).nullable().optional(),
  expiration_date: vine.string().nullable().optional(),
  active: vine.boolean().optional(),
})
