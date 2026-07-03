import { LearnLessonQuestionsQuizzSchema } from '#database/schema'
import { beforeCreate, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import LearnLesson from '#models/learn/lesson'
import LearnEnrollment from '#models/learn/enrollment'

export default class LearnLessonQuestionsQuiz extends LearnLessonQuestionsQuizzSchema {
  @belongsTo(() => LearnLesson, { foreignKey: 'lessonId' })
  declare lesson: BelongsTo<typeof LearnLesson>

  @belongsTo(() => LearnEnrollment, { foreignKey: 'learnEnrollmentId' })
  declare enrollment: BelongsTo<typeof LearnEnrollment>

  @beforeCreate()
  static assignUuid(quiz: LearnLessonQuestionsQuiz) {
    quiz.id = quiz.id || crypto.randomUUID()
  }
}
