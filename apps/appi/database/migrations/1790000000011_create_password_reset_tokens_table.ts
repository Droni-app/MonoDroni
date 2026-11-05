import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'password_reset_tokens'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('token_hash', 64).notNullable().unique()
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      // The site the request came from, to brand the page the link opens
      table.uuid('site_id').nullable().references('id').inTable('sites').onDelete('SET NULL')
      table.timestamp('expires_at').notNullable()
      table.timestamp('used_at').nullable()
      table.timestamp('created_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
