import { SiteSchema } from '#database/schema'
import { beforeCreate, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Enrollment from '#models/enrollment'
export default class Site extends SiteSchema {
  @hasMany(() => Enrollment)
  declare enrollments: HasMany<typeof Enrollment>

  @beforeCreate()
  static assignUuid(site: Site) {
    site.id = site.id || crypto.randomUUID()
  }
}
