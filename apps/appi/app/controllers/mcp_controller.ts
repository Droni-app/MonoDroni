import type { HttpContext } from '@adonisjs/core/http'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { appiClient } from '#services/mcp/appi_client'
import { mcpModules } from '#services/mcp/modules'
import { MULTI_SITE_INSTRUCTIONS, multiSite } from '#services/mcp/multi_site'

export default class McpController {
  /**
   * Stateless Streamable HTTP: a fresh server + transport per request, no MCP sessions.
   * The transport writes straight to the raw Node response, so Adonis skips its own.
   */
  async handle(ctx: HttpContext) {
    const { params, response } = ctx
    const register = mcpModules[params.module]
    if (!register) {
      return response.notFound({ message: `Unknown MCP module "${params.module}"` })
    }

    // /mcp/:siteId/:module pins one site (resolved by SiteMiddleware); /mcp/:module
    // serves every site the caller can reach, with site_id as a per-tool argument
    if (params.siteId) {
      const server = new McpServer({ name: `appi-${params.module}`, version: '1.0.0' })
      register(server, appiClient(ctx, ctx.site.id))
      return this.serve(ctx, server)
    }

    const server = new McpServer(
      { name: `appi-${params.module}`, version: '1.0.0' },
      { instructions: MULTI_SITE_INSTRUCTIONS }
    )
    const scoped = multiSite(server, ctx)
    register(scoped.server, scoped.call)
    return this.serve(ctx, server)
  }

  private async serve({ request, response }: HttpContext, server: McpServer) {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    })
    response.response.on('close', () => {
      transport.close()
      server.close()
    })

    await server.connect(transport)
    // The bodyparser already consumed the stream, so hand over the JSON-RPC body. Re-parse
    // the raw text: request.body() has convertEmptyStringsToNull applied, which would turn
    // tool arguments like "" into null
    const raw = request.raw()
    await transport.handleRequest(
      request.request,
      response.response,
      raw ? JSON.parse(raw) : undefined
    )
  }

  /**
   * GET (server-initiated SSE stream) and DELETE (session termination) only make
   * sense with MCP sessions, which this stateless server doesn't keep.
   */
  async methodNotAllowed({ response }: HttpContext) {
    response.header('Allow', 'POST')
    return response.status(405).json({ message: 'Method Not Allowed' })
  }
}
