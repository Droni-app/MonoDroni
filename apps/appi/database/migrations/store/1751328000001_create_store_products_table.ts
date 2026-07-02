import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'store_products'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('site_id').notNullable().references('id').inTable('sites').onDelete('CASCADE')
      table.string('slug').notNullable()
      table.unique(['site_id', 'slug'])
      table.string('name').notNullable()
      table.text('description').nullable()
      table.text('content').nullable()
      table.string('picture').nullable()
      table.decimal('price', 10, 2).notNullable().defaultTo(0)
      table.integer('stock').notNullable().defaultTo(0)
      table.json('tags').nullable()
      table.decimal('size_w', 8, 2).nullable()
      table.decimal('size_h', 8, 2).nullable()
      table.decimal('size_d', 8, 2).nullable()
      table.decimal('weight', 8, 3).nullable()
      table.boolean('active').notNullable().defaultTo(false)
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
