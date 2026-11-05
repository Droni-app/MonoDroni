import type { HttpContext } from '@adonisjs/core/http'
import OauthClient from '#models/oauth/oauth_client'
import {
  AUTHORIZATION_CODE_GRANT,
  generateToken,
  hashToken,
  isAllowedRedirectUri,
  REFRESH_TOKEN_GRANT,
} from '#services/oauth/oauth_service'

const AUTH_METHODS = ['none', 'client_secret_post', 'client_secret_basic']
const GRANT_TYPES = [AUTHORIZATION_CODE_GRANT, REFRESH_TOKEN_GRANT]

export default class RegistrationsController {
  /**
   * @store
   * @summary Registro dinámico de clientes OAuth (RFC 7591)
   * @requestBody {"client_name": "Mi asistente", "redirect_uris": ["https://ejemplo.com/callback"], "token_endpoint_auth_method": "none"}
   * @responseBody 201 - {"client_id": "uuid", "client_name": "Mi asistente", "redirect_uris": ["https://ejemplo.com/callback"], "grant_types": ["authorization_code", "refresh_token"], "response_types": ["code"], "token_endpoint_auth_method": "none"}
   * @responseBody 400 - {"error": "invalid_redirect_uri", "error_description": "string"}
   */
  async store({ request, response }: HttpContext) {
    const body = request.body()
    const invalid = (error: string, description: string) =>
      response.status(400).json({ error, error_description: description })

    const redirectUris = body.redirect_uris
    if (
      !Array.isArray(redirectUris) ||
      !redirectUris.length ||
      redirectUris.length > 20 ||
      !redirectUris.every(isAllowedRedirectUri)
    ) {
      return invalid(
        'invalid_redirect_uri',
        'redirect_uris must be https, loopback http or a private-use scheme, without fragment'
      )
    }

    // Per RFC 7591 the default method is client_secret_basic
    const authMethod = body.token_endpoint_auth_method ?? 'client_secret_basic'
    if (!AUTH_METHODS.includes(authMethod)) {
      return invalid('invalid_client_metadata', 'Unsupported token_endpoint_auth_method')
    }
    const grantTypes = body.grant_types ?? GRANT_TYPES
    if (
      !Array.isArray(grantTypes) ||
      !grantTypes.includes(AUTHORIZATION_CODE_GRANT) ||
      !grantTypes.every((grant) => GRANT_TYPES.includes(grant))
    ) {
      return invalid('invalid_client_metadata', 'Unsupported grant_types')
    }
    const responseTypes = body.response_types ?? ['code']
    if (!Array.isArray(responseTypes) || responseTypes.some((type) => type !== 'code')) {
      return invalid('invalid_client_metadata', 'Only the "code" response type is supported')
    }
    const name = body.client_name ?? 'Cliente sin nombre'
    if (typeof name !== 'string' || name.length > 255) {
      return invalid('invalid_client_metadata', 'Invalid client_name')
    }

    const secret = authMethod === 'none' ? null : generateToken()
    const client = await OauthClient.create({
      id: crypto.randomUUID(),
      type: 'dynamic',
      name,
      secretHash: secret ? hashToken(secret) : null,
      redirectUris,
      grantTypes,
      tokenEndpointAuthMethod: authMethod,
    })

    response.header('Cache-Control', 'no-store')
    return response.created({
      client_id: client.id,
      client_id_issued_at: Math.floor(Date.now() / 1000),
      ...(secret ? { client_secret: secret, client_secret_expires_at: 0 } : {}),
      client_name: client.name,
      redirect_uris: client.redirectUris,
      grant_types: client.grantTypes,
      response_types: ['code'],
      token_endpoint_auth_method: client.tokenEndpointAuthMethod,
    })
  }
}
