import { StoreProductSchema } from '#database/schema'
import { beforeCreate, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Site from '#models/site'
import StoreProductAttribute from '#models/store/product_attribute'

export default class StoreProduct extends StoreProductSchema {
  @belongsTo(() => Site)
  declare site: BelongsTo<typeof Site>

  @hasMany(() => StoreProductAttribute, { foreignKey: 'productId' })
  declare attributes: HasMany<typeof StoreProductAttribute>

  @beforeCreate()
  static assignUuid(product: StoreProduct) {
    product.id = product.id ?? crypto.randomUUID()
  }
}
