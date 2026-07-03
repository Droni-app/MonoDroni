import vine from '@vinejs/vine'

export const storeQuizValidator = vine.create({
  answers: vine
    .array(
      vine.object({
        question_id: vine.string(),
        selected: vine.number().min(1).max(5),
      })
    )
    .minLength(1),
})
