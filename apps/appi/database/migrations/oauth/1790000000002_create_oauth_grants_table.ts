import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'oauth_grants'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table
        .string('client_id', 512)
        .notNullable()
        .references('id')
        .inTable('oauth_clients')
        .onDelete('CASCADE')
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      // Canonical MCP URL the tokens are bound to; null means every MCP module of this server
      table.string('resource', 512).nullable()
      table.string('scope', 255).notNullable()
      table.string('access_token_hash', 64).notNullable().unique()
      table.timestamp('access_expires_at').notNullable()
      table.string('refresh_token_hash', 64).nullable().unique()
      table.string('previous_refresh_token_hash', 64).nullable().index()
      table.timestamp('refresh_expires_at').nullable()
      table.timestamp('revoked_at').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
