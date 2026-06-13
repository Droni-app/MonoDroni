import { SocialReplySchema } from '#database/schema'
import { beforeCreate, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import SocialTopic from '#models/social/topic'

export default class SocialReply extends SocialReplySchema {
  @belongsTo(() => SocialTopic)
  declare topic: BelongsTo<typeof SocialTopic>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @beforeCreate()
  static assignUuid(reply: SocialReply) {
    reply.id = reply.id ?? crypto.randomUUID()
  }
}
