import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'social_comments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable()
      table.string('site_id').notNullable().references('id').inTable('sites').onDelete('CASCADE')
      table.string('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.uuid('parent_id').nullable()
      table.string('commentable_type').notNullable()
      table.uuid('commentable_id').notNullable()
      table.text('content').notNullable()
      table.boolean('is_edited').defaultTo(false)
      table.boolean('active').defaultTo(false)
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
