import { SocialTopicSchema } from '#database/schema'
import { beforeCreate, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Site from '#models/site'
import User from '#models/user'
import SocialReply from '#models/social/reply'

export default class SocialTopic extends SocialTopicSchema {
  @belongsTo(() => Site)
  declare site: BelongsTo<typeof Site>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => SocialReply, { foreignKey: 'topicId' })
  declare replies: HasMany<typeof SocialReply>

  @beforeCreate()
  static assignUuid(topic: SocialTopic) {
    topic.id = topic.id ?? crypto.randomUUID()
  }
}
