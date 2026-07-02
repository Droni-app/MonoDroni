import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'store_order_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table
        .uuid('order_id')
        .notNullable()
        .references('id')
        .inTable('store_orders')
        .onDelete('CASCADE')
      table
        .uuid('product_id')
        .nullable()
        .references('id')
        .inTable('store_products')
        .onDelete('SET NULL')
      table.integer('quantity').notNullable().defaultTo(1)
      table.decimal('price', 10, 2).notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
