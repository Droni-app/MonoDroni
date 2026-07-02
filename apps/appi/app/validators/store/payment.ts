import vine from '@vinejs/vine'

export const storePaymentValidator = vine.create({
  order_id: vine.string(),
  payment_method: vine.string(),
  amount: vine.number().min(0),
  currency: vine.string().optional(),
  transaction_id: vine.string().nullable().optional(),
})
