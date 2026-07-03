import vine from '@vinejs/vine'

export const storeLessonQuestionValidator = vine.create({
  question_id: vine.string(),
})
