import { createHash, randomBytes } from 'node:crypto'
import { oauthCallbackUrl, safeRedirectPath, setOauthFlow } from '../../../utils/appi_session'

export default defineEventHandler((event) => {
  const runtimeConfig = useRuntimeConfig()
  const redirect = safeRedirectPath(getQuery(event).redirect)

  if (!runtimeConfig.appiOauthClientId) {
    console.error('NUXT_APPI_OAUTH_CLIENT_ID is not configured')
    return sendRedirect(event, `/login?error=login&redirect=${encodeURIComponent(redirect)}`)
  }

  const state = randomBytes(32).toString('base64url')
  const verifier = randomBytes(32).toString('base64url')
  setOauthFlow(event, { state, verifier, redirect })

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: String(runtimeConfig.appiOauthClientId),
    redirect_uri: oauthCallbackUrl(),
    state,
    code_challenge: createHash('sha256').update(verifier).digest('base64url'),
    code_challenge_method: 'S256',
  })

  return sendRedirect(event, `${String(runtimeConfig.appi).replace(/\/+$/, '')}/oauth/authorize?${params}`)
})
