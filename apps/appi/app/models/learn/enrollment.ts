import { LearnEnrollmentSchema } from '#database/schema'
import { beforeCreate, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import LearnCourse from '#models/learn/course'
import User from '#models/user'
import LearnLessonView from '#models/learn/lesson_view'
import LearnLessonAnswer from '#models/learn/lesson_answer'
import LearnLessonQuestionsQuiz from '#models/learn/lesson_questions_quiz'

export default class LearnEnrollment extends LearnEnrollmentSchema {
  @belongsTo(() => LearnCourse, { foreignKey: 'courseId' })
  declare course: BelongsTo<typeof LearnCourse>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => LearnLessonView, { foreignKey: 'learnEnrollmentId' })
  declare lessonViews: HasMany<typeof LearnLessonView>

  @hasMany(() => LearnLessonAnswer, { foreignKey: 'learnEnrollmentId' })
  declare lessonAnswers: HasMany<typeof LearnLessonAnswer>

  @hasMany(() => LearnLessonQuestionsQuiz, { foreignKey: 'learnEnrollmentId' })
  declare quizzes: HasMany<typeof LearnLessonQuestionsQuiz>

  @beforeCreate()
  static assignUuid(enrollment: LearnEnrollment) {
    enrollment.id = enrollment.id || crypto.randomUUID()
  }
}
