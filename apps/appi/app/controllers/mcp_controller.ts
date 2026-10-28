import type { HttpContext } from '@adonisjs/core/http'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { appiClient } from '#services/mcp/appi_client'
import { mcpModules } from '#services/mcp/modules'

export default class McpController {
  /**
   * Stateless Streamable HTTP: a fresh server + transport per request, no MCP sessions.
   * The transport writes straight to the raw Node response, so Adonis skips its own.
   */
  async handle(ctx: HttpContext) {
    const { params, request, response } = ctx
    const register = mcpModules[params.module]
    if (!register) {
      return response.notFound({ message: `Unknown MCP module "${params.module}"` })
    }

    const server = new McpServer({ name: `appi-${params.module}`, version: '1.0.0' })
    register(server, appiClient(ctx))

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    })
    response.response.on('close', () => {
      transport.close()
      server.close()
    })

    await server.connect(transport)
    // The bodyparser already consumed the stream, so hand over the parsed JSON-RPC body
    await transport.handleRequest(request.request, response.response, request.body())
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
