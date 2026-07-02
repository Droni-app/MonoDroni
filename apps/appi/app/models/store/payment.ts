import { StorePaymentSchema } from '#database/schema'
import { beforeCreate, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import StoreOrder from '#models/store/order'

export default class StorePayment extends StorePaymentSchema {
  @belongsTo(() => StoreOrder, { foreignKey: 'orderId' })
  declare order: BelongsTo<typeof StoreOrder>

  @beforeCreate()
  static assignUuid(payment: StorePayment) {
    payment.id = payment.id ?? crypto.randomUUID()
  }
}
