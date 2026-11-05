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
  const failed = (reason: string) => {
    console.error(`appi oauth callback failed: ${reason}`)
    return sendRedirect(event, `/login?${new URLSearchParams({ error: 'login', redirect })}`)
  }

  if (!flow) {
    return failed('no flow cookie')
  }
  if (query.state !== flow.state) {
    return failed('state mismatch')
  }
  // The user went back from appi's page: /login would send them straight there again
  if (query.error === 'access_denied') {
    return sendRedirect(event, redirect)
  }
  if (query.error) {
    return failed(`error param: ${String(query.error).slice(0, 64)}`)
  }
  if (typeof query.code !== 'string') {
    return failed('no code')
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
    const oauthError = (e as { data?: { error?: unknown } }).data?.error
    return failed(`token exchange: ${e instanceof Error ? e.message : e} (${String(oauthError)})`)
  }

  return sendRedirect(event, redirect)
})
