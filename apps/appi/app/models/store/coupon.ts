import { StoreCouponSchema } from '#database/schema'
import { beforeCreate, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Site from '#models/site'

export default class StoreCoupon extends StoreCouponSchema {
  @belongsTo(() => Site)
  declare site: BelongsTo<typeof Site>

  @beforeCreate()
  static assignUuid(coupon: StoreCoupon) {
    coupon.id = coupon.id ?? crypto.randomUUID()
  }
}
