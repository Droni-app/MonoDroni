import path from 'node:path'
import url from 'node:url'

export default {
  path: path.dirname(url.fileURLToPath(import.meta.url)) + '/../',
  title: 'Droni API',
  version: '2.0.0',
  description: 'Multi-tenant SaaS API for the Droni platform.',
  tagIndex: 1,
  info: {
    title: 'Droni API',
    version: '2.0.0',
    description: 'Multi-tenant SaaS API for the Droni platform.',
  },
  snakeCase: true,
  debug: false,
  ignore: ['/swagger', '/docs', '/'],
  preferredPutPatch: 'PATCH',
  common: {
    parameters: {},
    headers: {
      'x-site-id': {
        description: 'Tenant site identifier (required on every request)',
        required: true,
        schema: { type: 'string' },
      },
    },
  },
  authMiddlewares: ['auth'],
  defaultSecurityScheme: 'BearerAuth',
  persistAuthorization: true,
  securitySchemes: {
    BearerAuth: { type: 'http', scheme: 'bearer' },
  },
  showFullPath: false,
}
