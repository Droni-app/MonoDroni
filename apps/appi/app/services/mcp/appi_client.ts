import type { HttpContext } from '@adonisjs/core/http'
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import env from '#start/env'

type Query = Record<string, string | number | boolean | string[] | undefined>

export type AppiCall = (
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  options?: { query?: Query; body?: unknown }
) => Promise<CallToolResult>

/**
 * MCP tools never touch models directly: each tool call is replayed as an HTTP
 * request against appi's own routes (loopback), forwarding the caller's bearer
 * token and site. That way auth/adminSite/enrolledUser middleware, Vine
 * validators and controllers stay the single source of truth for permissions.
 * `siteId` is omitted only for site-agnostic routes such as auth/sites.
 */
export function appiClient(ctx: HttpContext, siteId?: string): AppiCall {
  const baseUrl = env.get('APPI_INTERNAL_URL') ?? `http://127.0.0.1:${env.get('PORT')}`
  const headers: Record<string, string> = {
    'accept': 'application/json',
    'content-type': 'application/json',
  }
  if (siteId) {
    headers['x-site-id'] = siteId
  }
  const authorization = ctx.request.header('authorization')
  if (authorization) {
    headers['authorization'] = authorization
  }

  return async (method, path, options = {}) => {
    const url = new URL(path, `${baseUrl}/`)
    for (const [key, value] of Object.entries(options.query ?? {})) {
      if (value === undefined) continue
      if (Array.isArray(value)) {
        value.forEach((item) => url.searchParams.append(key, item))
      } else {
        url.searchParams.set(key, String(value))
      }
    }

    try {
      const res = await fetch(url, {
        method,
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
      })
      const text = await res.text()
      // Errors (401/403/404/422) go back verbatim so the model can see what failed and retry
      return {
        isError: !res.ok,
        content: [{ type: 'text', text: res.ok ? text : `HTTP ${res.status}: ${text}` }],
      }
    } catch (error) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Request to appi failed: ${(error as Error).message}` }],
      }
    }
  }
}
