import { defineConfig } from '@outloud/adonis-openapi'
import env from '#start/env'
import packageJson from '../package.json' with { type: 'json' }

const openapiConfig = defineConfig({
  enabled: true,
  provider: 'scalar',
  document: {
    info: {
      title: 'Droni.co API',
      version: packageJson.version,
    },
    servers: [{ url: env.get('APP_URL', 'http://localhost:' + env.get('PORT')) }],
  },
  generator: {
    resolve: import.meta.resolve,
    routes: true,
  },
})

export default openapiConfig
