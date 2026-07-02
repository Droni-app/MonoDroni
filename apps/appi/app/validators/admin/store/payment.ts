import vine from '@vinejs/vine'

export const updatePaymentValidator = vine.create({
  payment_status: vine.enum(['pending', 'completed', 'failed']),
})
