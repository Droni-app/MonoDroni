import vine from '@vinejs/vine'

export const storeQuestionValidator = vine.create({
  name: vine.string(),
  description: vine.string().nullable().optional(),
  picture: vine.string().nullable().optional(),
  attachment: vine.string().nullable().optional(),
  response_1: vine.string(),
  response_2: vine.string(),
  response_3: vine.string().nullable().optional(),
  response_4: vine.string().nullable().optional(),
  response_5: vine.string().nullable().optional(),
  response_correct: vine.number().min(1).max(5),
})

export const updateQuestionValidator = vine.create({
  name: vine.string().optional(),
  description: vine.string().nullable().optional(),
  picture: vine.string().nullable().optional(),
  attachment: vine.string().nullable().optional(),
  response_1: vine.string().optional(),
  response_2: vine.string().optional(),
  response_3: vine.string().nullable().optional(),
  response_4: vine.string().nullable().optional(),
  response_5: vine.string().nullable().optional(),
  response_correct: vine.number().min(1).max(5).optional(),
})
