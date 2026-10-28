import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import Site from '#models/site'

export default class SiteMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    // MCP clients can't always send custom headers, so /mcp/:siteId/:module carries it in the URL
    const siteId = ctx.request.header('x-site-id') ?? ctx.params.siteId ?? null
    // exclude routes that don't require site context, such as email verification and domain validation
    if (
      ctx.request.url().startsWith('/auth/verify-email') ||
      ctx.request.url() === '/201aae24c561528ec1542b94df7e1db9.txt' ||
      ctx.request.url() === '/docs' ||
      ctx.request.url() === '/openapi.json'
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
