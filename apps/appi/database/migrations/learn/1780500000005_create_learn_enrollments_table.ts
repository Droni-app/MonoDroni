import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'learn_enrollments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table
        .uuid('course_id')
        .notNullable()
        .references('id')
        .inTable('learn_courses')
        .onDelete('CASCADE')
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.unique(['course_id', 'user_id'])
      table.enum('role', ['student', 'teacher', 'admin']).notNullable().defaultTo('student')
      table
        .enum('status', ['pending', 'active', 'completed', 'canceled'])
        .notNullable()
        .defaultTo('pending')
      table.decimal('progress', 5, 2).notNullable().defaultTo(0)
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
