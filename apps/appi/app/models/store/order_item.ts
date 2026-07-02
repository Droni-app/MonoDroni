import { StoreOrderItemSchema } from '#database/schema'
import { beforeCreate, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import StoreOrder from '#models/store/order'
import StoreProduct from '#models/store/product'

export default class StoreOrderItem extends StoreOrderItemSchema {
  @belongsTo(() => StoreOrder, { foreignKey: 'orderId' })
  declare order: BelongsTo<typeof StoreOrder>

  @belongsTo(() => StoreProduct, { foreignKey: 'productId' })
  declare product: BelongsTo<typeof StoreProduct>

  @beforeCreate()
  static assignUuid(item: StoreOrderItem) {
    item.id = item.id ?? crypto.randomUUID()
  }
}
