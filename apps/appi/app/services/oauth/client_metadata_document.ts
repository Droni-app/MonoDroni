import { lookup, type LookupAddress } from 'node:dns'
import { request } from 'node:https'
import { BlockList, isIP } from 'node:net'
import { DateTime } from 'luxon'
import OauthClient from '#models/oauth/oauth_client'
import {
  AUTHORIZATION_CODE_GRANT,
  isAllowedRedirectUri,
  REFRESH_TOKEN_GRANT,
} from '#services/oauth/oauth_service'

const MAX_DOCUMENT_BYTES = 5 * 1024
const FETCH_TIMEOUT_MS = 5000
const DEFAULT_CACHE_SECONDS = 60 * 60
const MIN_CACHE_SECONDS = 5 * 60
const MAX_CACHE_SECONDS = 24 * 60 * 60

const blockedAddresses = new BlockList()
for (const [network, prefix] of [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
] as const) {
  blockedAddresses.addSubnet(network, prefix, 'ipv4')
}
blockedAddresses.addAddress('::', 'ipv6')
blockedAddresses.addAddress('::1', 'ipv6')
blockedAddresses.addSubnet('64:ff9b::', 96, 'ipv6')
blockedAddresses.addSubnet('fc00::', 7, 'ipv6')
blockedAddresses.addSubnet('fe80::', 10, 'ipv6')
blockedAddresses.addSubnet('ff00::', 8, 'ipv6')

export function isBlockedAddress(address: string) {
  return blockedAddresses.check(address, isIP(address) === 6 ? 'ipv6' : 'ipv4')
}

/**
 * Checks addresses while connecting rather than before, so a host can't pass the check
 * and then rebind its DNS to an internal address when the request goes out.
 */
const publicAddressLookup = ((hostname: string, options: any, callback: any) => {
  lookup(hostname, { ...options, all: true }, (error, addresses: LookupAddress[]) => {
    if (error) {
      return callback(error)
    }
    if (!addresses.length || addresses.some(({ address }) => isBlockedAddress(address))) {
      return callback(new Error(`"${hostname}" does not resolve to a public address`))
    }
    return options.all
      ? callback(null, addresses)
      : callback(null, addresses[0].address, addresses[0].family)
  })
}) as any

/**
 * client_id forms that may be fetched: an https URL with a path, no credentials, custom
 * port or IP literal. Comparing against href rejects anything URL parsing would rewrite
 * (dot segments, uppercase host), since the document must echo the id exactly.
 */
export function isMetadataDocumentUrl(clientId: string) {
  if (!clientId.startsWith('https://') || clientId.length > 512) {
    return false
  }
  try {
    const url = new URL(clientId)
    return (
      url.href === clientId &&
      url.pathname !== '/' &&
      !url.hash &&
      !url.username &&
      !url.password &&
      !url.port &&
      !isIP(url.hostname.replace(/^\[|\]$/g, ''))
    )
  } catch {
    return false
  }
}

export type ClientMetadata = {
  name: string
  redirectUris: string[]
  grantTypes: string[]
}

/**
 * Only public clients: private_key_jwt isn't supported and a document is public, so it
 * can't carry a shared secret.
 */
export function parseMetadataDocument(clientId: string, body: string): ClientMetadata | null {
  let document: any
  try {
    document = JSON.parse(body)
  } catch {
    return null
  }
  if (
    document?.client_id !== clientId ||
    typeof document.client_name !== 'string' ||
    !document.client_name.trim() ||
    document.client_name.length > 255 ||
    !Array.isArray(document.redirect_uris) ||
    !document.redirect_uris.length ||
    document.redirect_uris.length > 20 ||
    !document.redirect_uris.every(isAllowedRedirectUri) ||
    (document.token_endpoint_auth_method ?? 'none') !== 'none' ||
    document.client_secret !== undefined
  ) {
    return null
  }

  const grantTypes = Array.isArray(document.grant_types)
    ? document.grant_types.filter((grant: unknown) =>
        [AUTHORIZATION_CODE_GRANT, REFRESH_TOKEN_GRANT].includes(grant as string)
      )
    : [AUTHORIZATION_CODE_GRANT, REFRESH_TOKEN_GRANT]
  if (!grantTypes.includes(AUTHORIZATION_CODE_GRANT)) {
    return null
  }
  return { name: document.client_name, redirectUris: document.redirect_uris, grantTypes }
}

export function cacheSeconds(cacheControl: string | undefined) {
  if (cacheControl && /\bno-(store|cache)\b/i.test(cacheControl)) {
    return MIN_CACHE_SECONDS
  }
  const maxAge = Number(cacheControl?.match(/\bmax-age=(\d+)/i)?.[1] ?? DEFAULT_CACHE_SECONDS)
  return Math.min(Math.max(maxAge, MIN_CACHE_SECONDS), MAX_CACHE_SECONDS)
}

function fetchDocument(clientId: string) {
  return new Promise<{ body: string; cacheControl?: string }>((resolve, reject) => {
    const req = request(
      clientId,
      {
        lookup: publicAddressLookup,
        headers: { accept: 'application/json' },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      },
      (res) => {
        // Redirects aren't followed: the document must live at the client_id itself
        if (res.statusCode !== 200) {
          res.destroy()
          return reject(new Error(`Unexpected status ${res.statusCode}`))
        }
        const chunks: Buffer[] = []
        let size = 0
        res.on('data', (chunk: Buffer) => {
          size += chunk.length
          if (size > MAX_DOCUMENT_BYTES) {
            res.destroy()
            return reject(new Error('Client metadata document too large'))
          }
          chunks.push(chunk)
        })
        res.on('error', reject)
        res.on('end', () =>
          resolve({
            body: Buffer.concat(chunks).toString('utf8'),
            cacheControl: res.headers['cache-control'],
          })
        )
      }
    )
    req.on('error', reject)
    req.end()
  })
}

/**
 * Client ID Metadata Documents: the client_id is an https URL hosting the client's
 * metadata. The row is a cache of that document, refreshed once it goes stale. A failed
 * refresh returns null instead of the stale row, so a client whose document has gone
 * away can't start new authorizations; tokens it already holds keep working.
 */
export async function resolveMetadataDocumentClient(clientId: string) {
  if (!isMetadataDocumentUrl(clientId)) {
    return null
  }
  const cached = await OauthClient.find(clientId)
  if (cached?.metadataExpiresAt && cached.metadataExpiresAt > DateTime.now()) {
    return cached
  }

  let fetched: { body: string; cacheControl?: string }
  try {
    fetched = await fetchDocument(clientId)
  } catch {
    return null
  }
  const metadata = parseMetadataDocument(clientId, fetched.body)
  if (!metadata) {
    return null
  }

  return OauthClient.updateOrCreate(
    { id: clientId },
    {
      type: 'metadata_document',
      name: metadata.name,
      redirectUris: metadata.redirectUris,
      grantTypes: metadata.grantTypes,
      tokenEndpointAuthMethod: 'none',
      metadataExpiresAt: DateTime.now().plus({ seconds: cacheSeconds(fetched.cacheControl) }),
    }
  )
}
