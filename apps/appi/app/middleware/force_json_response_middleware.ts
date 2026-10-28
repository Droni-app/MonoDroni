import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class ForceJsonResponseMiddleware {
  handle(ctx: HttpContext, next: NextFn) {
    // The MCP transport requires the client's original Accept (application/json + text/event-stream)
    if (ctx.request.url().startsWith('/mcp/')) {
      return next()
    }
    ctx.request.request.headers.accept = 'application/json'
    return next()
  }
}
