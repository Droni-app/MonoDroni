import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import Site from '#models/site'

export default class SiteMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    // MCP clients can't always send custom headers, so /mcp/:siteId/:module carries it in the URL.
    // The URL wins: connector tokens are bound to it, a header must not move them to another site
    const siteId = ctx.params.siteId ?? ctx.request.header('x-site-id') ?? null
    // exclude routes that don't require site context, such as email verification and domain validation
    if (
      ctx.request.url().startsWith('/auth/verify-email') ||
      ctx.request.url() === '/201aae24c561528ec1542b94df7e1db9.txt' ||
      ctx.request.url() === '/docs' ||
      ctx.request.url() === '/openapi.json' ||
      // Site-agnostic: lists the user's sites, and the multi-site MCP picks one per tool call
      ctx.request.url() === '/auth/sites' ||
      // Revokes the token itself, and drodmin can log out before picking a site
      ctx.request.url() === '/auth/logout' ||
      // OAuth for MCP connectors happens at the user level, before any site is involved
      ctx.request.url().startsWith('/oauth/') ||
      ctx.request.url().startsWith('/.well-known/') ||
      ctx.route?.pattern === '/mcp/:module'
    ) {
      return await next()
    }
    console.log('siteId', siteId)
    const site = await Site.find(siteId)
    if (!site) {
      return ctx.response.status(400).json({ message: 'Invalid site ID' })
    }
    ctx.site = site
    return await next()
  }
}
