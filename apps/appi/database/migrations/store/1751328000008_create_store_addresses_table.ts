import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'store_addresses'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.uuid('site_id').notNullable().references('id').inTable('sites').onDelete('CASCADE')
      table
        .integer('city_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('store_cities')
        .onDelete('SET NULL')
      table.string('address_line1').notNullable()
      table.string('address_line2').nullable()
      table.string('postal_code').nullable()
      table.string('phone').nullable()
      table.text('comments').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
