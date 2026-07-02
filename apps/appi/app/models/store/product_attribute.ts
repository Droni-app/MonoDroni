import { StoreProductAttributeSchema } from '#database/schema'
import { beforeCreate, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import StoreProduct from '#models/store/product'

export default class StoreProductAttribute extends StoreProductAttributeSchema {
  @belongsTo(() => StoreProduct, { foreignKey: 'productId' })
  declare product: BelongsTo<typeof StoreProduct>

  @beforeCreate()
  static assignUuid(attr: StoreProductAttribute) {
    attr.id = attr.id ?? crypto.randomUUID()
  }
}
