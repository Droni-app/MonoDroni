import vine from '@vinejs/vine'

export const updateQuizValidator = vine.create({
  status: vine.enum(['pending', 'completed']).optional(),
  results: vine.number().min(0).max(100).nullable().optional(),
})
