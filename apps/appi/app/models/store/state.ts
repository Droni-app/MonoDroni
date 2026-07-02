import { StoreStateSchema } from '#database/schema'
import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import StoreCity from '#models/store/city'

export default class StoreState extends StoreStateSchema {
  @hasMany(() => StoreCity, { foreignKey: 'stateId' })
  declare cities: HasMany<typeof StoreCity>
}
