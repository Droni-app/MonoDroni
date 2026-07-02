import { StoreCitySchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import StoreState from '#models/store/state'

export default class StoreCity extends StoreCitySchema {
  @belongsTo(() => StoreState, { foreignKey: 'stateId' })
  declare state: BelongsTo<typeof StoreState>
}
