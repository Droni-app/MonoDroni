import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'store_coupons'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('site_id').notNullable().references('id').inTable('sites').onDelete('CASCADE')
      table.string('code').notNullable()
      table.unique(['site_id', 'code'])
      table.decimal('discount', 10, 2).notNullable()
      table.string('discount_type').notNullable().defaultTo('percentage')
      table.decimal('minimum_order_value', 10, 2).nullable()
      table.timestamp('expiration_date').nullable()
      table.boolean('active').notNullable().defaultTo(true)
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
