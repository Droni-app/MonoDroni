import vine from '@vinejs/vine'

export const storeShippingRuleValidator = vine.create({
  name: vine.string(),
  state_id: vine.number().nullable().optional(),
  city_id: vine.number().nullable().optional(),
  price: vine.number().min(0),
  price_per_kg: vine.number().min(0).nullable().optional(),
  price_per_cm3: vine.number().min(0).nullable().optional(),
  active: vine.boolean().optional(),
})

export const updateShippingRuleValidator = vine.create({
  name: vine.string().optional(),
  state_id: vine.number().nullable().optional(),
  city_id: vine.number().nullable().optional(),
  price: vine.number().min(0).optional(),
  price_per_kg: vine.number().min(0).nullable().optional(),
  price_per_cm3: vine.number().min(0).nullable().optional(),
  active: vine.boolean().optional(),
})
