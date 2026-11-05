import { args, BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class OauthSpaClient extends BaseCommand {
  static commandName = 'oauth:spa-client'
  static description = 'Register a first-party single-page app, without a secret or a site'
  static options: CommandOptions = { startApp: true }

  @args.string({ description: 'Name shown on the login page' })
  declare name: string

  @args.string({ description: 'Exact redirect URI: https, or loopback http for development' })
  declare redirectUri: string

  async run() {
    const { default: OauthClient } = await import('#models/oauth/oauth_client')
    const { AUTHORIZATION_CODE_GRANT, FIRST_PARTY_CLIENT, isAllowedRedirectUri } =
      await import('#services/oauth/oauth_service')

    if (!isAllowedRedirectUri(this.redirectUri) || !/^https?:/.test(this.redirectUri)) {
      this.logger.error('The redirect URI must be https, or http on a loopback address')
      this.exitCode = 1
      return
    }

    const client = await OauthClient.create({
      id: crypto.randomUUID(),
      type: FIRST_PARTY_CLIENT,
      name: this.name,
      redirectUris: [this.redirectUri],
      grantTypes: [AUTHORIZATION_CODE_GRANT],
      tokenEndpointAuthMethod: 'none',
    })

    this.logger.log(`client_id: ${client.id}`)
  }
}
