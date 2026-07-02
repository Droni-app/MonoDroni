import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'store_payments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table
        .uuid('order_id')
        .notNullable()
        .references('id')
        .inTable('store_orders')
        .onDelete('CASCADE')
      table.string('payment_method').notNullable()
      table.string('payment_status').notNullable().defaultTo('pending')
      table.string('transaction_id').nullable()
      table.decimal('amount', 10, 2).notNullable()
      table.string('currency').notNullable().defaultTo('USD')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
