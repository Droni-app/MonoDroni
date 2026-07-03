import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'learn_lesson_answers'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table
        .uuid('lesson_id')
        .notNullable()
        .references('id')
        .inTable('learn_lessons')
        .onDelete('CASCADE')
      table
        .uuid('learn_enrollment_id')
        .notNullable()
        .references('id')
        .inTable('learn_enrollments')
        .onDelete('CASCADE')
      table.unique(['lesson_id', 'learn_enrollment_id'])
      table.text('answer').notNullable()
      table.string('attachment').nullable()
      table.text('feedback').nullable()
      table.decimal('result', 5, 2).nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
