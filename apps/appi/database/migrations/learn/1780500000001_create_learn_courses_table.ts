import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'learn_courses'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('site_id').notNullable().references('id').inTable('sites').onDelete('CASCADE')
      table.string('slug').notNullable()
      table.unique(['site_id', 'slug'])
      table.string('name').notNullable()
      table.string('group').nullable()
      table.text('description').nullable()
      table.string('picture').nullable()
      table.string('video').nullable()
      table.boolean('auto_enroll').notNullable().defaultTo(false)
      table.boolean('active').notNullable().defaultTo(false)
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
