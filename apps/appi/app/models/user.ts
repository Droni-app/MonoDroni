import { UserSchema } from '#database/schema'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { type AccessToken, DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'

import { beforeCreate, hasMany } from '@adonisjs/lucid/orm'
import * as nodeCrypto from 'node:crypto'
import Enrollment from './enrollment.ts'
import type { HasMany } from '@adonisjs/lucid/types/relations'

export default class User extends compose(UserSchema, withAuthFinder(hash)) {
  static accessTokens = DbAccessTokensProvider.forModel(User)
  declare currentAccessToken?: AccessToken

  @hasMany(() => Enrollment)
  declare enrollments: HasMany<typeof Enrollment>

  @beforeCreate()
  static async assignUuid(user: User) {
    user.id = nodeCrypto.randomUUID()
  }
}
