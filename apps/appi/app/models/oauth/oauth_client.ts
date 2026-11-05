import { OauthClientSchema } from '#database/schema'
import { belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Site from '#models/site'

const jsonColumn = {
  prepare: (value: string[]) => JSON.stringify(value),
  consume: (value: string | string[]) => (typeof value === 'string' ? JSON.parse(value) : value),
}

/**
 * The generated schema types json columns as string; these hold string[] (see jsonColumn),
 * which can only override that declaration as any.
 */
export default class OauthClient extends OauthClientSchema {
  @column(jsonColumn)
  declare redirectUris: any

  @column(jsonColumn)
  declare grantTypes: any

  @belongsTo(() => Site)
  declare site: BelongsTo<typeof Site>
}
