import { StoreShippingRuleSchema } from '#database/schema'
import { beforeCreate, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Site from '#models/site'
import StoreState from '#models/store/state'
import StoreCity from '#models/store/city'

export default class StoreShippingRule extends StoreShippingRuleSchema {
  @belongsTo(() => Site)
  declare site: BelongsTo<typeof Site>

  @belongsTo(() => StoreState, { foreignKey: 'stateId' })
  declare state: BelongsTo<typeof StoreState>

  @belongsTo(() => StoreCity, { foreignKey: 'cityId' })
  declare city: BelongsTo<typeof StoreCity>

  @beforeCreate()
  static assignUuid(rule: StoreShippingRule) {
    rule.id = rule.id ?? crypto.randomUUID()
  }
}
