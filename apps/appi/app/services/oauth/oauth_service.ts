import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import env from '#start/env'
import { mcpModules } from '#services/mcp/modules'
import Site from '#models/site'

export const OAUTH_SCOPE = 'mcp'
export const ACCESS_TOKEN_TTL_SECONDS = 60 * 60
export const REFRESH_TOKEN_TTL_DAYS = 90
export const AUTHORIZATION_CODE_TTL_MINUTES = 5

/**
 * First-party clients are web apps registered by an admin (`node ace oauth:first-party-client`),
 * the only ones that get a REST api token. Their users' sessions live in the client.
 */
export const FIRST_PARTY_CLIENT = 'first_party'
export const FIRST_PARTY_SCOPE = 'api'
export const FIRST_PARTY_TOKEN_TTL_DAYS = 7

export const AUTHORIZATION_CODE_GRANT = 'authorization_code'
export const REFRESH_TOKEN_GRANT = 'refresh_token'

/**
 * The prefixes keep these credentials apart from the REST API's oat_ tokens: the api
 * guard rejects them, so a connector's token only ever works on the MCP routes.
 */
export const ACCESS_TOKEN_PREFIX = 'mcpat_'
export const REFRESH_TOKEN_PREFIX = 'mcprt_'

const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]'])
const FORBIDDEN_REDIRECT_SCHEMES = new Set([
  'javascript:',
  'data:',
  'file:',
  'vbscript:',
  'about:',
  'blob:',
  'ftp:',
  'ws:',
  'wss:',
])

export function issuer() {
  return env.get('APP_URL').replace(/\/+$/, '')
}

export function hashToken(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

export function generateToken(prefix = '') {
  return `${prefix}${randomBytes(32).toString('base64url')}`
}

export function safeEqual(a: string, b: string) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && timingSafeEqual(left, right)
}

export function verifyPkce(verifier: string, challenge: string) {
  if (!/^[A-Za-z0-9\-._~]{43,128}$/.test(verifier)) {
    return false
  }
  return safeEqual(createHash('sha256').update(verifier).digest('base64url'), challenge)
}

export function resourceMetadataUrl(resource: string) {
  return `${issuer()}/.well-known/oauth-protected-resource${resource.slice(issuer().length)}`
}

export type McpResource = { url: string; module: string; site: Site | null }

/**
 * Resolves a `resource` parameter (RFC 8707) to one of this server's MCP endpoints,
 * in canonical form. Anything else isn't a resource this server can issue tokens for.
 */
export async function parseResource(value: string): Promise<McpResource | null> {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return null
  }
  if (url.origin !== new URL(issuer()).origin || url.search || url.hash) {
    return null
  }

  const match = url.pathname.replace(/\/+$/, '').match(/^\/mcp(?:\/([^/]+))?\/([^/]+)$/)
  if (!match || !Object.hasOwn(mcpModules, match[2])) {
    return null
  }
  const [, siteId, module] = match
  const site = siteId ? await Site.find(siteId) : null
  if (siteId && !site) {
    return null
  }
  return { url: `${issuer()}${url.pathname.replace(/\/+$/, '')}`, module, site }
}

/**
 * https, loopback http, or a native app's private scheme (cursor://…), which the MCP
 * spec doesn't list but OAuth 2.1 allows for native clients and desktop assistants use.
 */
export function isAllowedRedirectUri(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 2048) {
    return false
  }
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return false
  }
  if (url.hash || url.username || url.password || FORBIDDEN_REDIRECT_SCHEMES.has(url.protocol)) {
    return false
  }
  return url.protocol !== 'http:' || LOOPBACK_HOSTS.has(url.hostname)
}

/**
 * Exact match, except for the port of loopback http URIs: native clients listen on
 * whichever port is free when the flow starts (RFC 8252 §7.3).
 */
export function redirectUriMatches(registered: string[], requested: string) {
  if (registered.includes(requested)) {
    return true
  }
  let target: URL
  try {
    target = new URL(requested)
  } catch {
    return false
  }
  if (target.protocol !== 'http:' || !LOOPBACK_HOSTS.has(target.hostname)) {
    return false
  }
  target.port = ''
  return registered.some((uri) => {
    const candidate = new URL(uri)
    if (candidate.protocol !== 'http:') {
      return false
    }
    candidate.port = ''
    return candidate.href === target.href
  })
}

export function isLoopbackRedirect(uri: string) {
  const url = new URL(uri)
  return url.protocol === 'http:' && LOOPBACK_HOSTS.has(url.hostname)
}
