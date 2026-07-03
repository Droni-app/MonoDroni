import { LearnLessonViewSchema } from '#database/schema'
import { beforeCreate, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import LearnLesson from '#models/learn/lesson'
import LearnEnrollment from '#models/learn/enrollment'

export default class LearnLessonView extends LearnLessonViewSchema {
  @belongsTo(() => LearnLesson, { foreignKey: 'lessonId' })
  declare lesson: BelongsTo<typeof LearnLesson>

  @belongsTo(() => LearnEnrollment, { foreignKey: 'learnEnrollmentId' })
  declare enrollment: BelongsTo<typeof LearnEnrollment>

  @beforeCreate()
  static assignUuid(view: LearnLessonView) {
    view.id = view.id || crypto.randomUUID()
  }
}
