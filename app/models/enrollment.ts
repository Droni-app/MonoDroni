import { EnrollmentSchema } from '#database/schema'
import { beforeCreate, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Site from '#models/site'
import User from '#models/user'

export default class Enrollment extends EnrollmentSchema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Site)
  declare site: BelongsTo<typeof Site>

  @beforeCreate()
  static assignUuid(enrollment: Enrollment) {
    enrollment.id = enrollment.id || crypto.randomUUID()
  }
}
