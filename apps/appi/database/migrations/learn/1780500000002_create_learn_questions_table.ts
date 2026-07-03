import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'learn_questions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table
        .uuid('course_id')
        .notNullable()
        .references('id')
        .inTable('learn_courses')
        .onDelete('CASCADE')
      table.string('name').notNullable()
      table.text('description').nullable()
      table.string('picture').nullable()
      table.string('attachment').nullable()
      table.string('response_1').notNullable()
      table.string('response_2').notNullable()
      table.string('response_3').nullable()
      table.string('response_4').nullable()
      table.string('response_5').nullable()
      table.integer('response_correct').notNullable()
      table.integer('wons').notNullable().defaultTo(0)
      table.integer('losses').notNullable().defaultTo(0)
      table.decimal('difficulty', 5, 2).notNullable().defaultTo(0)
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
