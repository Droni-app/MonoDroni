import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'oauth_clients'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      // A generated uuid (dynamic, first party) or the document's https URL (metadata document)
      table.string('id', 512).primary()
      table.uuid('site_id').nullable().references('id').inTable('sites').onDelete('CASCADE')
      table.enum('type', ['dynamic', 'metadata_document', 'first_party']).notNullable()
      table.string('secret_hash', 64).nullable()
      table.string('name', 255).notNullable()
      table.json('redirect_uris').notNullable()
      table.json('grant_types').notNullable()
      table.string('token_endpoint_auth_method', 32).notNullable()
      table.timestamp('metadata_expires_at').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
