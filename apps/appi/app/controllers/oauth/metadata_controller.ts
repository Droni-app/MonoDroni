import type { HttpContext } from '@adonisjs/core/http'
import { issuer, OAUTH_SCOPE, parseResource } from '#services/oauth/oauth_service'

export default class MetadataController {
  /**
   * @protectedResource
   * @summary Metadata de un servidor MCP como recurso protegido (RFC 9728)
   * @responseBody 200 - {"resource": "https://appi.droni.co/mcp/content", "authorization_servers": ["https://appi.droni.co"], "scopes_supported": ["mcp"], "bearer_methods_supported": ["header"]}
   * @responseBody 404 - {"message": "Unknown MCP resource"}
   */
  async protectedResource({ params, response }: HttpContext) {
    const resource = await parseResource(`${issuer()}/${params['*'].join('/')}`)
    if (!resource) {
      return response.notFound({ message: 'Unknown MCP resource' })
    }

    return {
      resource: resource.url,
      authorization_servers: [issuer()],
      scopes_supported: [OAUTH_SCOPE],
      bearer_methods_supported: ['header'],
      resource_name: resource.site
        ? `Appi ${resource.module} (${resource.site.name})`
        : `Appi ${resource.module}`,
    }
  }

  /**
   * @authorizationServer
   * @summary Metadata del servidor de autorización (RFC 8414)
   * @responseBody 200 - {"issuer": "https://appi.droni.co", "authorization_endpoint": "https://appi.droni.co/oauth/authorize", "token_endpoint": "https://appi.droni.co/oauth/token", "code_challenge_methods_supported": ["S256"]}
   */
  async authorizationServer() {
    const base = issuer()
    return {
      issuer: base,
      authorization_endpoint: `${base}/oauth/authorize`,
      token_endpoint: `${base}/oauth/token`,
      registration_endpoint: `${base}/oauth/register`,
      revocation_endpoint: `${base}/oauth/revoke`,
      scopes_supported: [OAUTH_SCOPE],
      response_types_supported: ['code'],
      response_modes_supported: ['query'],
      grant_types_supported: ['authorization_code', 'refresh_token'],
      code_challenge_methods_supported: ['S256'],
      token_endpoint_auth_methods_supported: ['none', 'client_secret_post', 'client_secret_basic'],
      revocation_endpoint_auth_methods_supported: [
        'none',
        'client_secret_post',
        'client_secret_basic',
      ],
      client_id_metadata_document_supported: true,
      authorization_response_iss_parameter_supported: true,
    }
  }
}
