import vine from '@vinejs/vine'

export const storeOrderValidator = vine.create({
  items: vine
    .array(
      vine.object({
        product_id: vine.string(),
        quantity: vine.number().min(1),
      })
    )
    .minLength(1),
  shipping_address: vine.any().optional(),
  billing_address: vine.any().optional(),
  coupon_code: vine.string().nullable().optional(),
})
