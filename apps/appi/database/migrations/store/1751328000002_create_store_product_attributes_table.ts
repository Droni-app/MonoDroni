import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'store_product_attributes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table
        .uuid('product_id')
        .notNullable()
        .references('id')
        .inTable('store_products')
        .onDelete('CASCADE')
      table.string('name').notNullable()
      table.string('value').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
