import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { DateTime } from 'luxon'
import OauthGrant from '#models/oauth/oauth_grant'
import { loopbackCredential } from '#services/mcp/loopback_credential'
import {
  ACCESS_TOKEN_PREFIX,
  hashToken,
  issuer,
  OAUTH_SCOPE,
  resourceMetadataUrl,
} from '#services/oauth/oauth_service'

/**
 * OAuth 2.1 resource server check for the MCP routes. The 401 challenge is what makes
 * MCP clients start the OAuth flow: its resource_metadata leads them to discovery.
 */
export default class McpAuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const { request, response } = ctx
    const resource = `${issuer()}${request.url().replace(/\/+$/, '')}`
    const token = request.header('authorization')?.match(/^Bearer +(.+)$/i)?.[1]

    const grant = token?.startsWith(ACCESS_TOKEN_PREFIX)
      ? await OauthGrant.query()
          .where('access_token_hash', hashToken(token))
          .whereNull('revoked_at')
          .where('access_expires_at', '>', DateTime.now().toSQL({ includeOffset: false }))
          .preload('user')
          .first()
      : null

    // A null resource was authorized for all of this server's MCP modules
    if (!grant || (grant.resource !== null && grant.resource !== resource)) {
      const challenge = [
        `resource_metadata="${resourceMetadataUrl(resource)}"`,
        `scope="${OAUTH_SCOPE}"`,
        ...(token ? ['error="invalid_token"'] : []),
      ]
      response.header('WWW-Authenticate', `Bearer ${challenge.join(', ')}`)
      return response.unauthorized({ message: 'Unauthorized' })
    }

    ctx.mcpCredential = loopbackCredential(grant.user)
    return next()
  }
}
