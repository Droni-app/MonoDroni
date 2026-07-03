import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'learn_lessons'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table
        .uuid('course_id')
        .notNullable()
        .references('id')
        .inTable('learn_courses')
        .onDelete('CASCADE')
      table.string('slug').notNullable()
      table.unique(['course_id', 'slug'])
      table.string('name').notNullable()
      table.text('description').nullable()
      table.enum('format', ['text', 'html', 'markdown']).notNullable().defaultTo('markdown')
      table.text('content', 'longtext').nullable()
      table.text('activity', 'longtext').nullable()
      table.string('video').nullable()
      table.integer('order').notNullable().defaultTo(0)
      table.boolean('active').notNullable().defaultTo(false)
      table.timestamp('limit_date').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
