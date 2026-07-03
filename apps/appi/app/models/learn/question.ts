import { LearnQuestionSchema } from '#database/schema'
import { beforeCreate, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import LearnCourse from '#models/learn/course'
import LearnLessonQuestion from '#models/learn/lesson_question'

export default class LearnQuestion extends LearnQuestionSchema {
  @belongsTo(() => LearnCourse, { foreignKey: 'courseId' })
  declare course: BelongsTo<typeof LearnCourse>

  @hasMany(() => LearnLessonQuestion, { foreignKey: 'questionId' })
  declare lessonQuestions: HasMany<typeof LearnLessonQuestion>

  @beforeCreate()
  static assignUuid(question: LearnQuestion) {
    question.id = question.id || crypto.randomUUID()
  }
}
