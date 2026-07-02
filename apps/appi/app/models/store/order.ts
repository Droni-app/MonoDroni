import { StoreOrderSchema } from '#database/schema'
import { beforeCreate, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Site from '#models/site'
import User from '#models/user'
import StoreOrderItem from '#models/store/order_item'
import StorePayment from '#models/store/payment'

export default class StoreOrder extends StoreOrderSchema {
  @belongsTo(() => Site)
  declare site: BelongsTo<typeof Site>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => StoreOrderItem, { foreignKey: 'orderId' })
  declare items: HasMany<typeof StoreOrderItem>

  @hasMany(() => StorePayment, { foreignKey: 'orderId' })
  declare payments: HasMany<typeof StorePayment>

  @beforeCreate()
  static assignUuid(order: StoreOrder) {
    order.id = order.id ?? crypto.randomUUID()
  }
}
