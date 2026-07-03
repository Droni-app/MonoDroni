import { LearnLessonSchema } from '#database/schema'
import { beforeCreate, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import LearnCourse from '#models/learn/course'
import LearnLessonQuestion from '#models/learn/lesson_question'
import LearnLessonView from '#models/learn/lesson_view'
import LearnLessonAnswer from '#models/learn/lesson_answer'
import LearnLessonQuestionsQuiz from '#models/learn/lesson_questions_quiz'

export default class LearnLesson extends LearnLessonSchema {
  @belongsTo(() => LearnCourse, { foreignKey: 'courseId' })
  declare course: BelongsTo<typeof LearnCourse>

  @hasMany(() => LearnLessonQuestion, { foreignKey: 'lessonId' })
  declare lessonQuestions: HasMany<typeof LearnLessonQuestion>

  @hasMany(() => LearnLessonView, { foreignKey: 'lessonId' })
  declare views: HasMany<typeof LearnLessonView>

  @hasMany(() => LearnLessonAnswer, { foreignKey: 'lessonId' })
  declare answers: HasMany<typeof LearnLessonAnswer>

  @hasMany(() => LearnLessonQuestionsQuiz, { foreignKey: 'lessonId' })
  declare quizzes: HasMany<typeof LearnLessonQuestionsQuiz>

  @beforeCreate()
  static assignUuid(lesson: LearnLesson) {
    lesson.id = lesson.id || crypto.randomUUID()
  }
}
