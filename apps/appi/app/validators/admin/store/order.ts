import vine from '@vinejs/vine'

export const updateOrderValidator = vine.create({
  status: vine.enum(['pending', 'paid', 'shipped', 'completed', 'canceled']),
})
