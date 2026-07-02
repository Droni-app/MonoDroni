import { StoreAddressSchema } from '#database/schema'
import { beforeCreate, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Site from '#models/site'
import StoreCity from '#models/store/city'

export default class StoreAddress extends StoreAddressSchema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Site)
  declare site: BelongsTo<typeof Site>

  @belongsTo(() => StoreCity, { foreignKey: 'cityId' })
  declare city: BelongsTo<typeof StoreCity>

  @beforeCreate()
  static assignUuid(address: StoreAddress) {
    address.id = address.id ?? crypto.randomUUID()
  }
}
