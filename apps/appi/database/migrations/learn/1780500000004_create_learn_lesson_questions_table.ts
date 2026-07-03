import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'learn_lesson_questions'

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
        .uuid('question_id')
        .notNullable()
        .references('id')
        .inTable('learn_questions')
        .onDelete('CASCADE')
      table.unique(['lesson_id', 'question_id'])
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
