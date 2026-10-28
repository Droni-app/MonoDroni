import { AsyncLocalStorage } from 'node:async_hooks'
import type { HttpContext } from '@adonisjs/core/http'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { appiClient, type AppiCall } from '#services/mcp/appi_client'
import type { ToolServer } from '#services/mcp/shared'

export const MULTI_SITE_INSTRUCTIONS =
  'Este servidor trabaja sobre varios sitios: todas las tools (salvo list_my_sites) requieren site_id. ' +
  'Si el usuario no indicó el sitio, llama a list_my_sites y pregúntale cuál usar; ' +
  'después reutiliza ese site_id hasta que pida cambiar de sitio.'

/**
 * Adapts a module's tools for the site-agnostic route (POST /mcp/:module): every
 * tool gains a required `site_id` argument, which is stripped before the module's
 * handler runs and becomes the x-site-id of that call's loopback requests.
 * AsyncLocalStorage keeps concurrent tool calls (JSON-RPC batches) from mixing sites.
 */
export function multiSite(server: McpServer, ctx: HttpContext) {
  const currentSite = new AsyncLocalStorage<string>()

  const call: AppiCall = (method, path, options) =>
    appiClient(ctx, currentSite.getStore())(method, path, options)

  // Configs come already typed from each module's registerTool call; the SDK's
  // overloads can't be resolved for a config built at runtime, so forward untyped
  const registerTool = server.registerTool.bind(server) as (...args: any[]) => any
  const siteScoped: ToolServer = {
    registerTool: ((name: string, config: any, handler: any) =>
      registerTool(
        name,
        {
          ...config,
          inputSchema: {
            site_id: z.string().describe('ID del sitio (obténlo con list_my_sites)'),
            ...config.inputSchema,
          },
        },
        ({ site_id: siteId, ...args }: any, extra: any) =>
          currentSite.run(siteId, () => handler(args, extra))
      )) as ToolServer['registerTool'],
  }

  server.registerTool(
    'list_my_sites',
    {
      title: 'Listar mis sitios',
      description:
        'Lista los sitios a los que tiene acceso el usuario autenticado, con su rol en cada uno (owner = puede usar las tools admin_*). Úsala para obtener el site_id.',
      inputSchema: {},
      annotations: { readOnlyHint: true },
    },
    () => appiClient(ctx)('GET', 'auth/sites')
  )

  return { server: siteScoped, call }
}
