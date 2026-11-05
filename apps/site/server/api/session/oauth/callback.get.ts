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
  const loginPage = (error?: string) =>
    sendRedirect(
      event,
      `/login?${new URLSearchParams({ ...(error ? { error } : {}), redirect })}`,
    )

  if (!flow || query.state !== flow.state) {
    return loginPage('login')
  }
  if (query.error) {
    return loginPage(query.error === 'access_denied' ? undefined : 'login')
  }
  if (typeof query.code !== 'string') {
    return loginPage('login')
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
    return loginPage('login')
  }

  return sendRedirect(event, redirect)
})
