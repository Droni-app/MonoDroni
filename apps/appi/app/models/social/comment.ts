import { SocialCommentSchema } from '#database/schema'
import { beforeCreate, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Site from '#models/site'
import User from '#models/user'

export default class SocialComment extends SocialCommentSchema {
  @belongsTo(() => Site)
  declare site: BelongsTo<typeof Site>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => SocialComment, { foreignKey: 'parentId' })
  declare parent: BelongsTo<typeof SocialComment>

  @hasMany(() => SocialComment, { foreignKey: 'parentId' })
  declare children: HasMany<typeof SocialComment>

  @beforeCreate()
  static assignUuid(comment: SocialComment) {
    comment.id = comment.id ?? crypto.randomUUID()
  }
}
