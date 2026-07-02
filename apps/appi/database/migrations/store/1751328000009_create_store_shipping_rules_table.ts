import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'store_shipping_rules'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('site_id').notNullable().references('id').inTable('sites').onDelete('CASCADE')
      table.string('name').notNullable()
      table
        .integer('state_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('store_states')
        .onDelete('SET NULL')
      table
        .integer('city_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('store_cities')
        .onDelete('SET NULL')
      // base/fixed price; when price_per_kg/price_per_cm3 are set, acts as base rate
      table.decimal('price', 10, 2).notNullable().defaultTo(0)
      table.decimal('price_per_kg', 10, 4).nullable()
      table.decimal('price_per_cm3', 14, 8).nullable()
      table.boolean('active').notNullable().defaultTo(true)
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
