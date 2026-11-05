import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import OauthAuthorizationCode from '#models/oauth/oauth_authorization_code'
import OauthClient from '#models/oauth/oauth_client'
import OauthGrant from '#models/oauth/oauth_grant'
import User from '#models/user'
import {
  ACCESS_TOKEN_PREFIX,
  ACCESS_TOKEN_TTL_SECONDS,
  AUTHORIZATION_CODE_GRANT,
  FIRST_PARTY_CLIENT,
  FIRST_PARTY_SCOPE,
  FIRST_PARTY_TOKEN_TTL_DAYS,
  generateToken,
  hashToken,
  parseResource,
  REFRESH_TOKEN_GRANT,
  REFRESH_TOKEN_PREFIX,
  REFRESH_TOKEN_TTL_DAYS,
  safeEqual,
  verifyPkce,
} from '#services/oauth/oauth_service'

const sqlNow = () => DateTime.now().toSQL({ includeOffset: false })

function tokenColumns(client: OauthClient) {
  const accessToken = generateToken(ACCESS_TOKEN_PREFIX)
  const refreshToken = client.grantTypes.includes(REFRESH_TOKEN_GRANT)
    ? generateToken(REFRESH_TOKEN_PREFIX)
    : null
  return {
    accessToken,
    refreshToken,
    columns: {
      access_token_hash: hashToken(accessToken),
      access_expires_at: DateTime.now()
        .plus({ seconds: ACCESS_TOKEN_TTL_SECONDS })
        .toSQL({ includeOffset: false }),
      refresh_token_hash: refreshToken ? hashToken(refreshToken) : null,
      refresh_expires_at: refreshToken
        ? DateTime.now().plus({ days: REFRESH_TOKEN_TTL_DAYS }).toSQL({ includeOffset: false })
        : null,
    },
  }
}

function affectedRows(result: unknown) {
  return Array.isArray(result) ? (result[0] as number) : (result as number)
}

export default class TokensController {
  /**
   * @token
   * @summary Intercambia un código de autorización o refresh token por tokens de acceso
   * @responseBody 200 - {"access_token": "mcpat_xxx", "token_type": "Bearer", "expires_in": 3600, "refresh_token": "mcprt_xxx", "scope": "mcp"}
   * @responseBody 400 - {"error": "invalid_grant", "error_description": "string"}
   */
  async token(ctx: HttpContext) {
    const { request, response } = ctx
    response.header('Cache-Control', 'no-store')

    const client = await this.authenticateClient(ctx)
    if (!client) {
      return this.error(ctx, 401, 'invalid_client', 'Client authentication failed')
    }

    const grantType = request.input('grant_type')
    if (!client.grantTypes.includes(grantType)) {
      return this.error(ctx, 400, 'unauthorized_client', 'Grant type not allowed for this client')
    }
    if (grantType === AUTHORIZATION_CODE_GRANT) {
      return this.exchangeCode(ctx, client)
    }
    if (grantType === REFRESH_TOKEN_GRANT) {
      return this.refresh(ctx, client)
    }
    return this.error(ctx, 400, 'unsupported_grant_type', 'Unsupported grant type')
  }

  private async exchangeCode(ctx: HttpContext, client: OauthClient) {
    const { request } = ctx
    const code = String(request.input('code') ?? '')
    const row = await OauthAuthorizationCode.findBy('code_hash', hashToken(code))
    const invalid = () => this.error(ctx, 400, 'invalid_grant', 'Invalid authorization code')

    if (!row || row.clientId !== client.id) {
      return invalid()
    }
    if (row.usedAt) {
      // A replayed code may mean it was stolen, so what it issued can't be trusted either
      if (row.grantId) {
        await OauthGrant.query().where('id', row.grantId).update({ revoked_at: sqlNow() })
      }
      return invalid()
    }
    if (row.expiresAt < DateTime.now()) {
      return invalid()
    }
    if (!verifyPkce(String(request.input('code_verifier') ?? ''), row.codeChallenge)) {
      return invalid()
    }
    const redirectUri = request.input('redirect_uri')
    if (redirectUri && redirectUri !== row.redirectUri) {
      return invalid()
    }
    if (!(await this.resourceMatches(ctx, row.resource))) {
      return this.error(ctx, 400, 'invalid_target', 'resource does not match the authorization')
    }

    const claimed = await OauthAuthorizationCode.query()
      .where('id', row.id)
      .whereNull('used_at')
      .update({ used_at: sqlNow() })
    if (affectedRows(claimed) !== 1) {
      return invalid()
    }

    if (client.type === FIRST_PARTY_CLIENT) {
      const user = await User.findOrFail(row.userId)
      const token = await User.accessTokens.create(user, ['*'], {
        expiresIn: `${FIRST_PARTY_TOKEN_TTL_DAYS} days`,
      })
      await this.deleteExpired()
      return {
        access_token: token.value!.release(),
        token_type: 'Bearer',
        expires_in: FIRST_PARTY_TOKEN_TTL_DAYS * 24 * 60 * 60,
        scope: FIRST_PARTY_SCOPE,
      }
    }

    const { accessToken, refreshToken, columns } = tokenColumns(client)
    const grant = await OauthGrant.create({
      clientId: client.id,
      userId: row.userId,
      resource: row.resource,
      scope: row.scope,
      accessTokenHash: columns.access_token_hash,
      accessExpiresAt: DateTime.fromSQL(columns.access_expires_at!),
      refreshTokenHash: columns.refresh_token_hash,
      refreshExpiresAt: columns.refresh_expires_at
        ? DateTime.fromSQL(columns.refresh_expires_at)
        : null,
    })
    await OauthAuthorizationCode.query().where('id', row.id).update({ grant_id: grant.id })
    await this.deleteExpired()

    return this.tokenResponse(accessToken, refreshToken, grant.scope)
  }

  /**
   * Rotates on every use (OAuth 2.1 §4.3.1). The previous hash is kept so that replaying
   * an already rotated token, the sign of a leak, revokes the whole grant.
   */
  private async refresh(ctx: HttpContext, client: OauthClient) {
    const hash = hashToken(String(ctx.request.input('refresh_token') ?? ''))
    const invalid = () => this.error(ctx, 400, 'invalid_grant', 'Invalid refresh token')

    const grant = await OauthGrant.findBy('refresh_token_hash', hash)
    if (!grant) {
      await OauthGrant.query()
        .where('previous_refresh_token_hash', hash)
        .where('client_id', client.id)
        .update({ revoked_at: sqlNow() })
      return invalid()
    }
    if (
      grant.clientId !== client.id ||
      grant.revokedAt ||
      !grant.refreshExpiresAt ||
      grant.refreshExpiresAt < DateTime.now()
    ) {
      return invalid()
    }
    if (!(await this.resourceMatches(ctx, grant.resource))) {
      return this.error(ctx, 400, 'invalid_target', 'resource does not match the authorization')
    }

    const { accessToken, refreshToken, columns } = tokenColumns(client)
    const rotated = await OauthGrant.query()
      .where('id', grant.id)
      .where('refresh_token_hash', hash)
      .update({ ...columns, previous_refresh_token_hash: hash })
    if (affectedRows(rotated) !== 1) {
      return invalid()
    }

    return this.tokenResponse(accessToken, refreshToken, grant.scope)
  }

  /**
   * @revoke
   * @summary Revoca un token de acceso o refresh token y toda su autorización (RFC 7009)
   * @responseBody 200 - {}
   * @responseBody 401 - {"error": "invalid_client", "error_description": "string"}
   */
  async revoke(ctx: HttpContext) {
    const client = await this.authenticateClient(ctx)
    if (!client) {
      return this.error(ctx, 401, 'invalid_client', 'Client authentication failed')
    }

    const hash = hashToken(String(ctx.request.input('token') ?? ''))
    await OauthGrant.query()
      .where('client_id', client.id)
      .where((query) => query.where('access_token_hash', hash).orWhere('refresh_token_hash', hash))
      .update({ revoked_at: sqlNow() })

    // RFC 7009: unknown tokens also answer 200
    return {}
  }

  /**
   * Public clients only identify themselves (PKCE or the rotating refresh token proves
   * the rest); confidential ones must present their secret, via Basic or the body.
   */
  private async authenticateClient({ request }: HttpContext) {
    let clientId = request.input('client_id')
    let secret = request.input('client_secret')

    const basic = request.header('authorization')?.match(/^Basic +(.+)$/i)?.[1]
    if (basic) {
      const decoded = Buffer.from(basic, 'base64').toString('utf8')
      const separator = decoded.indexOf(':')
      if (separator === -1) {
        return null
      }
      try {
        clientId = decodeURIComponent(decoded.slice(0, separator))
        secret = decodeURIComponent(decoded.slice(separator + 1))
      } catch {
        return null
      }
    }

    if (typeof clientId !== 'string') {
      return null
    }
    const client = await OauthClient.find(clientId)
    if (!client) {
      return null
    }
    if (client.secretHash) {
      return typeof secret === 'string' && safeEqual(hashToken(secret), client.secretHash)
        ? client
        : null
    }
    return client
  }

  private async resourceMatches({ request }: HttpContext, bound: string | null) {
    const requested = request.input('resource')
    if (!requested) {
      return true
    }
    const resource = await parseResource(String(requested))
    return !!resource && (bound === null || resource.url === bound)
  }

  private async deleteExpired() {
    await OauthAuthorizationCode.query().where('expires_at', '<', sqlNow()).delete()
    await OauthGrant.query()
      .where('access_expires_at', '<', sqlNow())
      .where((query) =>
        query.whereNull('refresh_expires_at').orWhere('refresh_expires_at', '<', sqlNow())
      )
      .delete()
  }

  private tokenResponse(accessToken: string, refreshToken: string | null, scope: string) {
    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: ACCESS_TOKEN_TTL_SECONDS,
      scope,
      ...(refreshToken ? { refresh_token: refreshToken } : {}),
    }
  }

  private error({ response, request }: HttpContext, status: number, error: string, text: string) {
    if (status === 401 && request.header('authorization')) {
      response.header('WWW-Authenticate', 'Basic realm="oauth"')
    }
    return response.status(status).json({ error, error_description: text })
  }
}
