import { args, BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class OauthFirstPartyClient extends BaseCommand {
  static commandName = 'oauth:first-party-client'
  static description = 'Register a first-party web app as an OAuth client and print its credentials'
  static options: CommandOptions = { startApp: true }

  @args.string({ description: 'Id of the site this app belongs to, shown on the login page' })
  declare siteId: string

  @args.string({ description: 'Exact redirect URI: https, or loopback http for development' })
  declare redirectUri: string

  async run() {
    const { default: OauthClient } = await import('#models/oauth/oauth_client')
    const { default: Site } = await import('#models/site')
    const {
      AUTHORIZATION_CODE_GRANT,
      FIRST_PARTY_CLIENT,
      generateToken,
      hashToken,
      isAllowedRedirectUri,
    } = await import('#services/oauth/oauth_service')

    if (!isAllowedRedirectUri(this.redirectUri) || !/^https?:/.test(this.redirectUri)) {
      this.logger.error('The redirect URI must be https, or http on a loopback address')
      this.exitCode = 1
      return
    }

    const site = await Site.find(this.siteId)
    if (!site) {
      this.logger.error(`There is no site with id ${this.siteId}`)
      this.exitCode = 1
      return
    }

    const secret = generateToken()
    const client = await OauthClient.create({
      id: crypto.randomUUID(),
      type: FIRST_PARTY_CLIENT,
      name: site.name,
      siteId: site.id,
      secretHash: hashToken(secret),
      redirectUris: [this.redirectUri],
      grantTypes: [AUTHORIZATION_CODE_GRANT],
      tokenEndpointAuthMethod: 'client_secret_post',
    })

    // The secret is only stored hashed, so this is the one chance to see it
    this.logger.log(`client_id: ${client.id}`)
    this.logger.log(`client_secret: ${secret}`)
  }
}
