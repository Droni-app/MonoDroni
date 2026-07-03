import vine from '@vinejs/vine'

export const storeAnswerValidator = vine.create({
  answer: vine.string(),
  attachment: vine.string().nullable().optional(),
})
