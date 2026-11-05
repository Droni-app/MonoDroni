import { test } from '@japa/runner'
import {
  cacheSeconds,
  isBlockedAddress,
  isMetadataDocumentUrl,
  parseMetadataDocument,
} from '#services/oauth/client_metadata_document'
import { isAllowedRedirectUri, redirectUriMatches } from '#services/oauth/oauth_service'

const CLIENT_ID = 'https://app.example.com/oauth/client.json'
const documentWith = (overrides: object) =>
  JSON.stringify({
    client_id: CLIENT_ID,
    client_name: 'Example',
    redirect_uris: ['https://app.example.com/callback'],
    ...overrides,
  })

test.group('OAuth client metadata documents', () => {
  test('only accepts fetchable https URLs: {$self}')
    .with([
      'http://app.example.com/client.json',
      'https://app.example.com',
      'https://app.example.com/',
      'https://user:pass@app.example.com/client.json',
      'https://app.example.com:8443/client.json',
      'https://127.0.0.1/client.json',
      'https://[::1]/client.json',
      'https://app.example.com/a/../client.json',
      'https://APP.example.com/client.json',
      'https://app.example.com/client.json#frag',
    ])
    .run(({ assert }, url) => {
      assert.isFalse(isMetadataDocumentUrl(url))
    })

  test('accepts a regular metadata URL', ({ assert }) => {
    assert.isTrue(isMetadataDocumentUrl(CLIENT_ID))
  })

  test('blocks internal address {$self}')
    .with([
      '127.0.0.1',
      '10.0.0.5',
      '172.16.3.1',
      '192.168.1.1',
      '169.254.169.254',
      '100.64.0.1',
      '::1',
      'fe80::1',
      'fd00::1',
      '::ffff:127.0.0.1',
      '::ffff:169.254.169.254',
    ])
    .run(({ assert }, address) => {
      assert.isTrue(isBlockedAddress(address))
    })

  test('allows public addresses', ({ assert }) => {
    assert.isFalse(isBlockedAddress('93.184.216.34'))
    assert.isFalse(isBlockedAddress('2606:2800:220:1:248:1893:25c8:1946'))
  })

  test('parses a valid document', ({ assert }) => {
    assert.deepEqual(parseMetadataDocument(CLIENT_ID, documentWith({})), {
      name: 'Example',
      redirectUris: ['https://app.example.com/callback'],
      grantTypes: ['authorization_code', 'refresh_token'],
    })
  })

  test('rejects invalid document: {$self.name}')
    .with([
      { name: 'not JSON', body: '{' },
      { name: 'other client_id', body: documentWith({ client_id: `${CLIENT_ID}x` }) },
      { name: 'no name', body: documentWith({ client_name: undefined }) },
      { name: 'no redirects', body: documentWith({ redirect_uris: [] }) },
      {
        name: 'javascript redirect',
        body: documentWith({ redirect_uris: ['javascript:alert(1)'] }),
      },
      { name: 'http redirect', body: documentWith({ redirect_uris: ['http://evil.example/cb'] }) },
      {
        name: 'secret auth',
        body: documentWith({ token_endpoint_auth_method: 'client_secret_post' }),
      },
      { name: 'embedded secret', body: documentWith({ client_secret: 'x' }) },
      { name: 'no code grant', body: documentWith({ grant_types: ['refresh_token'] }) },
    ])
    .run(({ assert }, { body }) => {
      assert.isNull(parseMetadataDocument(CLIENT_ID, body))
    })

  test('bounds the cache lifetime', ({ assert }) => {
    assert.equal(cacheSeconds(undefined), 3600)
    assert.equal(cacheSeconds('max-age=1'), 300)
    assert.equal(cacheSeconds('public, max-age=7200'), 7200)
    assert.equal(cacheSeconds('max-age=9999999'), 86400)
    assert.equal(cacheSeconds('no-store'), 300)
  })
})

test.group('OAuth redirect URIs', () => {
  test('allows {$self}')
    .with([
      'https://claude.ai/api/mcp/auth_callback',
      'http://localhost:3000/cb',
      'http://127.0.0.1:1234/cb',
      'http://[::1]:1234/cb',
      'cursor://anysphere.cursor-mcp/oauth/callback',
    ])
    .run(({ assert }, uri) => {
      assert.isTrue(isAllowedRedirectUri(uri))
    })

  test('rejects {$self}')
    .with([
      'http://evil.example/cb',
      'javascript:alert(1)',
      'data:text/html,x',
      'https://a.example/cb#frag',
      'https://user@a.example/cb',
      'not a url',
    ])
    .run(({ assert }, uri) => {
      assert.isFalse(isAllowedRedirectUri(uri))
    })

  test('matches exactly, ignoring only the port of loopback http', ({ assert }) => {
    assert.isTrue(redirectUriMatches(['https://a.example/cb'], 'https://a.example/cb'))
    assert.isFalse(redirectUriMatches(['https://a.example/cb'], 'https://a.example/cb/'))
    assert.isFalse(redirectUriMatches(['https://a.example:1/cb'], 'https://a.example:2/cb'))
    assert.isTrue(redirectUriMatches(['http://localhost:1/cb'], 'http://localhost:2/cb'))
    assert.isFalse(redirectUriMatches(['http://localhost:1/cb'], 'http://localhost:2/other'))
    assert.isFalse(redirectUriMatches(['http://localhost:1/cb'], 'http://127.0.0.1:1/cb'))
    assert.isFalse(redirectUriMatches(['cursor://a/cb'], 'http://localhost/cb'))
  })
})
