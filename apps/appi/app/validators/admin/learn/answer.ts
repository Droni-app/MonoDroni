import vine from '@vinejs/vine'

export const storeAnswerValidator = vine.create({
  user_id: vine.string(),
  answer: vine.string(),
  attachment: vine.string().nullable().optional(),
  feedback: vine.string().nullable().optional(),
  result: vine.number().min(0).max(100).nullable().optional(),
})

export const updateAnswerValidator = vine.create({
  answer: vine.string().optional(),
  attachment: vine.string().nullable().optional(),
  feedback: vine.string().nullable().optional(),
  result: vine.number().min(0).max(100).nullable().optional(),
})
