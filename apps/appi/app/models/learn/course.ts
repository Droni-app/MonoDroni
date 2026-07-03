import { LearnCourseSchema } from '#database/schema'
import { beforeCreate, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Site from '#models/site'
import LearnLesson from '#models/learn/lesson'
import LearnQuestion from '#models/learn/question'
import LearnEnrollment from '#models/learn/enrollment'

export default class LearnCourse extends LearnCourseSchema {
  @belongsTo(() => Site)
  declare site: BelongsTo<typeof Site>

  @hasMany(() => LearnLesson, { foreignKey: 'courseId' })
  declare lessons: HasMany<typeof LearnLesson>

  @hasMany(() => LearnQuestion, { foreignKey: 'courseId' })
  declare questions: HasMany<typeof LearnQuestion>

  @hasMany(() => LearnEnrollment, { foreignKey: 'courseId' })
  declare enrollments: HasMany<typeof LearnEnrollment>

  @beforeCreate()
  static assignUuid(course: LearnCourse) {
    course.id = course.id || crypto.randomUUID()
  }
}
