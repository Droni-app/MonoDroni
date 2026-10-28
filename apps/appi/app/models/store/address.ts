import { StoreAddressSchema } from '#database/schema'
import { beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Site from '#models/site'
import StoreCity from '#models/store/city'

export default class StoreAddress extends StoreAddressSchema {
  // Lucid's snake_case strategy maps "addressLine1" to "address_line_1", but
  // the columns are "address_line1"/"address_line2", so name them explicitly.
  @column({ columnName: 'address_line1' })
  declare addressLine1: string

  @column({ columnName: 'address_line2' })
  declare addressLine2: string | null

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
