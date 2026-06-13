import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'content_attributes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table
        .uuid('content_post_id')
        .notNullable()
        .references('id')
        .inTable('content_posts')
        .onDelete('CASCADE')
      table.string('name').notNullable()
      table.string('type').notNullable().defaultTo('string')
      table.string('value').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
