import { ContentPostSchema } from '#database/schema'
import { beforeCreate, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Site from '#models/site'
import User from '#models/user'
import ContentPostAttribute from '#models/content/attribute'

export default class ContentPost extends ContentPostSchema {
  @belongsTo(() => Site)
  declare site: BelongsTo<typeof Site>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => ContentPostAttribute)
  declare attributes: HasMany<typeof ContentPostAttribute>

  @beforeCreate()
  static assignUuid(post: ContentPost) {
    post.id = post.id ?? crypto.randomUUID()
  }
}
