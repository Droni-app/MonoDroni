import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'oauth_authorization_codes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('code_hash', 64).notNullable().unique()
      table
        .string('client_id', 512)
        .notNullable()
        .references('id')
        .inTable('oauth_clients')
        .onDelete('CASCADE')
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.text('redirect_uri').notNullable()
      table.string('code_challenge', 64).notNullable()
      table.string('resource', 512).nullable()
      table.string('scope', 255).notNullable()
      table.timestamp('expires_at').notNullable()
      table.timestamp('used_at').nullable()
      // Set when redeemed, so replaying the code can revoke what it issued
      table
        .uuid('grant_id')
        .nullable()
        .references('id')
        .inTable('oauth_grants')
        .onDelete('SET NULL')
      table.timestamp('created_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
