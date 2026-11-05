import {
  consumeOauthFlow,
  oauthCallbackUrl,
  safeRedirectPath,
  setAppiToken,
} from '../../../utils/appi_session'

type TokenResponse = {
  access_token: string
}

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  const query = getQuery(event)
  const flow = consumeOauthFlow(event)
  const redirect = safeRedirectPath(flow?.redirect)
  const failed = () => sendRedirect(event, `/login?${new URLSearchParams({ error: 'login', redirect })}`)

  if (!flow || query.state !== flow.state) {
    return failed()
  }
  // The user went back from appi's page: /login would send them straight there again
  if (query.error === 'access_denied') {
    return sendRedirect(event, redirect)
  }
  if (query.error || typeof query.code !== 'string') {
    return failed()
  }

  try {
    const tokens = await $fetch<TokenResponse>(
      `${String(runtimeConfig.appi).replace(/\/+$/, '')}/oauth/token`,
      {
        method: 'POST',
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: String(runtimeConfig.appiOauthClientId),
          client_secret: String(runtimeConfig.appiOauthClientSecret),
          code: query.code,
          code_verifier: flow.verifier,
          redirect_uri: oauthCallbackUrl(),
        }),
      },
    )
    setAppiToken(event, tokens.access_token)
  } catch (e) {
    console.error('appi oauth token exchange failed:', e instanceof Error ? e.message : e)
    return failed()
  }

  return sendRedirect(event, redirect)
})
