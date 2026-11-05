import { OauthGrantSchema } from '#database/schema'
import { beforeCreate, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

/**
 * One row per connector authorization: refreshing rotates the hashes in place, so
 * revoking the row kills every token derived from it.
 */
export default class OauthGrant extends OauthGrantSchema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @beforeCreate()
  static assignUuid(grant: OauthGrant) {
    grant.id = grant.id || crypto.randomUUID()
  }
}
