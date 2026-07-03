import { LearnLessonQuestionSchema } from '#database/schema'
import { beforeCreate, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import LearnLesson from '#models/learn/lesson'
import LearnQuestion from '#models/learn/question'

export default class LearnLessonQuestion extends LearnLessonQuestionSchema {
  @belongsTo(() => LearnLesson, { foreignKey: 'lessonId' })
  declare lesson: BelongsTo<typeof LearnLesson>

  @belongsTo(() => LearnQuestion, { foreignKey: 'questionId' })
  declare question: BelongsTo<typeof LearnQuestion>

  @beforeCreate()
  static assignUuid(lessonQuestion: LearnLessonQuestion) {
    lessonQuestion.id = lessonQuestion.id || crypto.randomUUID()
  }
}
