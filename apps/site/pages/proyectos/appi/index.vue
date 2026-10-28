<template>
  <div>
    <UiHero>
      <div class="text-center md:text-start py-6">
        <h1 class="text-balance lg:text-4xl text-gray-800 drop-shadow-lg dark:text-gray-50">
          Appi · Documentación para desarrolladores
        </h1>
        <h4 class="text-balance text-sm lg:text-lg text-gray-800 drop-shadow-lg dark:text-gray-50">
          Construye tu propio sitio sobre los servicios de contenido, comunidad, tienda y cursos de Droni.
        </h4>
      </div>
    </UiHero>

    <div class="container mx-auto px-4 py-8 grid gap-8 lg:grid-cols-[14rem_1fr]">
      <aside class="lg:sticky lg:top-20 lg:self-start">
        <AppiNav />
      </aside>

      <div class="min-w-0 space-y-12 max-w-4xl">
        <section id="que-es">
          <h2 class="text-2xl font-bold mb-3">¿Qué es appi?</h2>
          <p class="text-zinc-600 dark:text-zinc-300 mb-3">
            Appi es un backend multi-sitio expuesto como servicio HTTP/JSON. Cada <strong>sitio</strong> es un espacio
            aislado con sus propios usuarios, contenidos, productos, pedidos y cursos. Tú pones el frontend
            (Nuxt, Next, Astro, una app móvil…) y appi pone la autenticación, los datos y las reglas de negocio.
          </p>
          <p class="text-zinc-600 dark:text-zinc-300">
            Droni.co mismo está construido así: este sitio y su panel de administración son dos clientes de appi.
          </p>
        </section>

        <section id="modulos">
          <h2 class="text-2xl font-bold mb-4">Módulos disponibles</h2>
          <div class="grid gap-4 sm:grid-cols-2">
            <NuxtLink
              v-for="mod in appiModules"
              :key="mod.slug"
              :to="`/proyectos/appi/${mod.slug}`"
              class="group rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div class="flex items-center gap-3 mb-2">
                <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-pink-600 text-xl dark:bg-pink-900/30 dark:text-pink-300">
                  <i :class="mod.icon" />
                </span>
                <h3 class="text-lg font-bold">{{ mod.name }}</h3>
                <span class="ml-auto text-xs text-zinc-400">{{ countEndpoints(mod) }} endpoints</span>
              </div>
              <p class="text-sm text-zinc-600 dark:text-zinc-300">{{ mod.summary }}</p>
              <span class="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-pink-600 dark:text-pink-400 group-hover:gap-2 transition-all">
                Ver referencia <i class="mdi mdi-arrow-right" />
              </span>
            </NuxtLink>
          </div>
        </section>

        <section id="site-id">
          <h2 class="text-2xl font-bold mb-3">1. Obtén tu siteId</h2>
          <p class="text-zinc-600 dark:text-zinc-300 mb-3">
            Para empezar necesitas que creemos tu sitio. Te entregaremos un <code>siteId</code> (UUID) y una cuenta
            con rol <strong>owner</strong>, con la que podrás administrar el contenido desde
            <a href="https://drodmin.droni.co" class="text-pink-600 dark:text-pink-400 underline">drodmin</a>
            o desde tu propio panel usando los endpoints de administración. Si vas a usar el inicio de sesión con Google,
            indícanos también las URLs de callback de tu frontend.
          </p>
          <NuxtLink to="/login" class="inline-flex items-center gap-2 text-sm font-semibold text-pink-600 dark:text-pink-400">
            Solicitar un sitio <i class="mdi mdi-arrow-top-right" />
          </NuxtLink>
        </section>

        <section id="peticiones">
          <h2 class="text-2xl font-bold mb-3">2. Haz tu primera petición</h2>
          <p class="text-zinc-600 dark:text-zinc-300 mb-3">
            Todas las rutas cuelgan de <code>{{ APPI_BASE_URL }}</code> y requieren el header <code>x-site-id</code>.
            Sin él (o con un id inválido) appi responde <code>400 Invalid site ID</code>.
          </p>
          <div class="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700 mb-4">
            <table class="w-full text-sm">
              <thead class="bg-zinc-50 dark:bg-zinc-800 text-left">
                <tr><th class="px-3 py-2">Header</th><th class="px-3 py-2">Cuándo</th><th class="px-3 py-2">Valor</th></tr>
              </thead>
              <tbody>
                <tr class="border-t border-zinc-200 dark:border-zinc-700"><td class="px-3 py-2"><code>x-site-id</code></td><td class="px-3 py-2">Siempre</td><td class="px-3 py-2">Tu siteId</td></tr>
                <tr class="border-t border-zinc-200 dark:border-zinc-700"><td class="px-3 py-2"><code>Accept</code></td><td class="px-3 py-2">Siempre</td><td class="px-3 py-2"><code>application/json</code></td></tr>
                <tr class="border-t border-zinc-200 dark:border-zinc-700"><td class="px-3 py-2"><code>Content-Type</code></td><td class="px-3 py-2">Peticiones con cuerpo</td><td class="px-3 py-2"><code>application/json</code> o <code>multipart/form-data</code> para archivos</td></tr>
                <tr class="border-t border-zinc-200 dark:border-zinc-700"><td class="px-3 py-2"><code>Authorization</code></td><td class="px-3 py-2">Rutas protegidas</td><td class="px-3 py-2"><code>Bearer &lt;token&gt;</code></td></tr>
              </tbody>
            </table>
          </div>
          <AppiCode label="curl" :code="curlExample" />
        </section>

        <section id="arquitectura">
          <h2 class="text-2xl font-bold mb-3">3. Arquitectura recomendada: llama a appi desde tu servidor</h2>
          <p class="text-zinc-600 dark:text-zinc-300 mb-3">
            Appi no está abierto a peticiones directas desde navegadores de dominios de terceros (CORS). La forma
            soportada es un <strong>backend-for-frontend</strong>: tu navegador habla con tu servidor y tu servidor
            habla con appi. Así además:
          </p>
          <ul class="list-disc pl-6 space-y-1 text-zinc-600 dark:text-zinc-300 mb-4">
            <li>El token del usuario vive en una cookie <code>httpOnly</code>, fuera del alcance de JavaScript del navegador.</li>
            <li>El <code>siteId</code> y la URL de appi se configuran como variables de entorno del servidor.</li>
            <li>Puedes cachear respuestas públicas (posts, productos, cursos) para ganar velocidad.</li>
          </ul>
          <p class="text-zinc-600 dark:text-zinc-300 mb-3">Ejemplo con Nuxt 3 — un proxy genérico en <code>server/api/appi/[...path].ts</code>:</p>
          <AppiCode label="server/api/appi/[...path].ts" :code="proxyExample" />
          <p class="text-zinc-600 dark:text-zinc-300 my-3">Y un endpoint de login que guarda el token en la cookie:</p>
          <AppiCode label="server/api/session/login.post.ts" :code="loginExample" />
        </section>

        <section id="autenticacion">
          <h2 class="text-2xl font-bold mb-3">4. Usuarios y roles</h2>
          <p class="text-zinc-600 dark:text-zinc-300 mb-3">
            Un usuario se registra con email y contraseña (y verifica su correo) o entra con Google. El login devuelve
            un token que debes enviar como <code>Authorization: Bearer</code>. Cada endpoint de esta documentación
            indica qué nivel de acceso necesita:
          </p>
          <div class="grid gap-2 sm:grid-cols-2">
            <div
              v-for="(info, key) in accessLabels"
              :key="key"
              class="rounded-lg border border-zinc-200 dark:border-zinc-700 p-3"
            >
              <p class="font-semibold text-sm">{{ info.label }}</p>
              <p class="text-xs text-zinc-500 dark:text-zinc-400">{{ info.description }}</p>
            </div>
          </div>
          <p class="text-zinc-600 dark:text-zinc-300 mt-3">
            Los roles de curso (student, teacher, admin) son independientes del rol en el sitio (user, owner); se
            explican en el módulo <NuxtLink to="/proyectos/appi/learn" class="text-pink-600 dark:text-pink-400 underline">Learn</NuxtLink>.
          </p>
        </section>

        <section id="convenciones">
          <h2 class="text-2xl font-bold mb-3">5. Convenciones</h2>
          <h3 class="font-bold mt-4 mb-2">Nombres de campos</h3>
          <p class="text-zinc-600 dark:text-zinc-300 mb-3">
            Los cuerpos de las peticiones usan <code>snake_case</code> (<code>coupon_code</code>, <code>per_page</code>)
            y las respuestas usan <code>camelCase</code> (<code>createdAt</code>, <code>autoEnroll</code>). Los ids son UUID
            y las fechas, ISO 8601. Los montos y porcentajes pueden llegar como string decimal: conviértelos con
            <code>Number()</code>.
          </p>
          <h3 class="font-bold mt-4 mb-2">Paginación</h3>
          <p class="text-zinc-600 dark:text-zinc-300 mb-3">
            Los listados aceptan <code>page</code> y <code>per_page</code> y responden con <code>meta</code> + <code>data</code>:
          </p>
          <AppiCode :code="paginationExample" />
          <h3 class="font-bold mt-6 mb-2">Slugs e ids</h3>
          <p class="text-zinc-600 dark:text-zinc-300">
            Las rutas públicas identifican posts, productos, temas, cursos y lecciones por <strong>slug</strong> (perfecto
            para URLs amigables). Las rutas de administración usan siempre el <strong>id</strong>.
          </p>
        </section>

        <section id="errores">
          <h2 class="text-2xl font-bold mb-3">6. Errores</h2>
          <div class="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700 mb-4">
            <table class="w-full text-sm">
              <thead class="bg-zinc-50 dark:bg-zinc-800 text-left">
                <tr><th class="px-3 py-2">Código</th><th class="px-3 py-2">Significado</th></tr>
              </thead>
              <tbody>
                <tr v-for="row in errorRows" :key="row.code" class="border-t border-zinc-200 dark:border-zinc-700">
                  <td class="px-3 py-2 font-mono">{{ row.code }}</td>
                  <td class="px-3 py-2 text-zinc-600 dark:text-zinc-300">{{ row.text }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="grid gap-4 lg:grid-cols-2">
            <AppiCode label="Error de negocio" :code="errorExample" />
            <AppiCode label="Error de validación (422)" :code="validationExample" />
          </div>
        </section>

        <section id="seguridad">
          <h2 class="text-2xl font-bold mb-3">7. Buenas prácticas de seguridad</h2>
          <ul class="space-y-2 text-zinc-600 dark:text-zinc-300">
            <li v-for="tip in securityTips" :key="tip" class="flex gap-2">
              <i class="mdi mdi-shield-check-outline text-emerald-500" />
              <span>{{ tip }}</span>
            </li>
          </ul>
        </section>

        <section id="mcp">
          <h2 class="text-2xl font-bold mb-3">8. Usa appi desde asistentes de IA (MCP)</h2>
          <p class="text-zinc-600 dark:text-zinc-300 mb-3">
            Appi expone sus módulos como servidores
            <a href="https://modelcontextprotocol.io" class="text-pink-600 dark:text-pink-400 underline">MCP</a>
            (Model Context Protocol), el estándar abierto para conectar asistentes como Claude con servicios externos.
            Conectas un servidor y puedes pedirle en lenguaje natural cosas como <em>"publica un borrador con este
            texto"</em>, <em>"¿qué pedidos siguen pendientes?"</em> o <em>"califica las respuestas de la lección 3"</em>.
          </p>
          <p class="text-zinc-600 dark:text-zinc-300 mb-4">
            Cada tool del MCP llama al mismo endpoint de la API que documenta esta página, con tu token. Por eso
            aplican exactamente los mismos permisos y validaciones: el asistente solo puede hacer lo que tu usuario
            puede hacer en ese sitio.
          </p>

          <h3 id="mcp-servidores" class="font-bold mt-6 mb-2">Servidores disponibles</h3>
          <p class="text-zinc-600 dark:text-zinc-300 mb-3">
            Hay un servidor por módulo, para que el asistente trabaje con pocas tools y bien enfocadas. Conecta solo
            los que necesites: un asistente de atención al cliente no necesita <code>store-admin</code>.
          </p>
          <div class="grid gap-4 sm:grid-cols-2 mb-4">
            <div
              v-for="srv in appiMcpServers"
              :key="srv.slug"
              class="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5"
            >
              <div class="flex items-center gap-3 mb-2">
                <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-pink-600 text-xl dark:bg-pink-900/30 dark:text-pink-300">
                  <i :class="srv.icon" />
                </span>
                <div class="min-w-0">
                  <h4 class="text-lg font-bold leading-tight">{{ srv.name }}</h4>
                  <code class="text-xs text-zinc-500 dark:text-zinc-400">/mcp/{{ srv.slug }}</code>
                </div>
                <span class="ml-auto text-xs text-zinc-400 shrink-0">{{ srv.tools.length }} tools</span>
              </div>
              <p class="text-sm text-zinc-600 dark:text-zinc-300 mb-2">{{ srv.summary }}</p>
              <p class="text-xs text-zinc-500 dark:text-zinc-400"><i class="mdi mdi-account-key-outline" /> {{ srv.audience }}</p>
            </div>
          </div>

          <h3 id="mcp-urls" class="font-bold mt-6 mb-2">URLs: varios sitios o un sitio fijo</h3>
          <div class="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700 mb-3">
            <table class="w-full text-sm">
              <thead class="bg-zinc-50 dark:bg-zinc-800 text-left">
                <tr><th class="px-3 py-2">Modo</th><th class="px-3 py-2">URL</th><th class="px-3 py-2">Cómo elige el sitio</th></tr>
              </thead>
              <tbody>
                <tr class="border-t border-zinc-200 dark:border-zinc-700">
                  <td class="px-3 py-2 font-semibold whitespace-nowrap">Varios sitios <span class="text-xs font-normal text-emerald-600 dark:text-emerald-400">(recomendado)</span></td>
                  <td class="px-3 py-2"><code>{{ APPI_BASE_URL }}/mcp/&lt;módulo&gt;</code></td>
                  <td class="px-3 py-2 text-zinc-600 dark:text-zinc-300">Cada tool recibe <code>site_id</code>. Incluye la tool <code>list_my_sites</code>.</td>
                </tr>
                <tr class="border-t border-zinc-200 dark:border-zinc-700">
                  <td class="px-3 py-2 font-semibold whitespace-nowrap">Un sitio fijo</td>
                  <td class="px-3 py-2"><code>{{ APPI_BASE_URL }}/mcp/&lt;siteId&gt;/&lt;módulo&gt;</code></td>
                  <td class="px-3 py-2 text-zinc-600 dark:text-zinc-300">El sitio va en la URL; las tools no piden <code>site_id</code>.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="text-zinc-600 dark:text-zinc-300 mb-3">
            Usa el modo de un sitio fijo para un asistente dedicado a un solo sitio (por ejemplo, el soporte de tu
            tienda). Usa el de varios sitios si administras más de uno: registras cada módulo una sola vez, sin
            importar cuántos sitios tengas.
          </p>

          <h3 id="mcp-token" class="font-bold mt-6 mb-2">Autenticación: obtén un token</h3>
          <p class="text-zinc-600 dark:text-zinc-300 mb-3">
            Los servidores MCP usan el mismo token que la API. Haz login con el <code>siteId</code> de un sitio en el
            que ya estés inscrito y copia el <code>token</code> de la respuesta. Un mismo token sirve para todos tus
            sitios: lo que cambia por sitio es tu rol.
          </p>
          <AppiCode label="curl" :code="mcpLoginExample" />
          <ul class="list-disc pl-6 space-y-1 text-zinc-600 dark:text-zinc-300 mt-3">
            <li>Haz un login exclusivo para el MCP: si reutilizas el token de otra sesión y cierras esa sesión, el MCP deja de funcionar.</li>
            <li>El token no vence. Trátalo como una contraseña y revócalo con <code>POST /auth/logout</code> (enviando ese token) cuando ya no lo uses.</li>
            <li>Si tu usuario es owner, el token da acceso a las tools <code>admin_*</code>. Para un asistente que solo debe leer o atender clientes, usa una cuenta con rol user.</li>
          </ul>

          <h3 id="mcp-claude-code" class="font-bold mt-6 mb-2">Conectar con Claude Code</h3>
          <p class="text-zinc-600 dark:text-zinc-300 mb-3">
            Agrega cada servidor con <code>claude mcp add</code>. <code>--scope user</code> lo deja disponible en
            todos tus proyectos. Comprueba la conexión con <code>/mcp</code> dentro de Claude Code.
          </p>
          <AppiCode label="bash" :code="mcpClaudeCodeExample" />
          <p class="text-zinc-600 dark:text-zinc-300 my-3">
            Para compartir la configuración en un repositorio, usa un <code>.mcp.json</code> y deja el token en una
            variable de entorno, nunca en el archivo:
          </p>
          <AppiCode label=".mcp.json" :code="mcpJsonExample" />

          <h3 id="mcp-desktop" class="font-bold mt-6 mb-2">Conectar con Claude Desktop</h3>
          <p class="text-zinc-600 dark:text-zinc-300 mb-3">
            Claude Desktop no permite enviar headers a un servidor remoto, así que se usa
            <code>mcp-remote</code> como puente. Edita <code>claude_desktop_config.json</code>
            (Settings → Developer → Edit Config) y reinicia la app:
          </p>
          <AppiCode label="claude_desktop_config.json" :code="mcpDesktopExample" />

          <h3 id="mcp-web" class="font-bold mt-6 mb-2">claude.ai y otros clientes web</h3>
          <p class="text-zinc-600 dark:text-zinc-300 mb-3">
            Los conectores personalizados de claude.ai (y de otros asistentes web) solo admiten servidores sin
            autenticación o con OAuth; no dejan configurar un token. Puedes agregar la URL de un módulo y usar las
            tools públicas (listar posts, productos o cursos), pero las que requieren sesión responderán
            <code>401</code>. El soporte de OAuth, para iniciar sesión desde el propio conector, aún no está disponible.
          </p>

          <h3 id="mcp-sitios" class="font-bold mt-6 mb-2">Trabajar con varios sitios</h3>
          <p class="text-zinc-600 dark:text-zinc-300 mb-3">
            En el modo de varios sitios no hay un sitio "activo" guardado en el servidor: el asistente envía
            <code>site_id</code> en cada llamada. Al conectarse recibe la instrucción de usar
            <code>list_my_sites</code> cuando no sepa en qué sitio trabajar, preguntarte cuál usar y mantenerlo
            hasta que le pidas cambiar. En la práctica:
          </p>
          <AppiCode label="conversación" :code="mcpConversationExample" />
          <p class="text-zinc-600 dark:text-zinc-300 mt-3">
            También puede trabajar con dos sitios en la misma conversación, por ejemplo para comparar sus catálogos.
          </p>

          <h3 id="mcp-permisos" class="font-bold mt-6 mb-2">Permisos y comportamiento</h3>
          <ul class="space-y-2 text-zinc-600 dark:text-zinc-300">
            <li v-for="tip in mcpNotes" :key="tip" class="flex gap-2">
              <i class="mdi mdi-information-outline text-sky-500" />
              <span>{{ tip }}</span>
            </li>
          </ul>

          <h3 id="mcp-tools" class="font-bold mt-6 mb-2">Catálogo de tools</h3>
          <p class="text-zinc-600 dark:text-zinc-300 mb-3">
            En el modo de varios sitios cada tool recibe además <code>site_id</code>. Los parámetros de cada tool
            son los del endpoint equivalente de esta documentación.
          </p>
          <div class="flex flex-wrap gap-3 text-xs mb-3">
            <span v-for="(info, kind) in mcpKinds" :key="kind" class="inline-flex items-center gap-1">
              <span class="rounded px-1.5 py-0.5 font-semibold" :class="info.class">{{ info.label }}</span>
              <span class="text-zinc-500 dark:text-zinc-400">{{ info.description }}</span>
            </span>
          </div>
          <div class="space-y-3">
            <details
              v-for="srv in appiMcpServers"
              :key="srv.slug"
              class="group rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
            >
              <summary class="flex cursor-pointer items-center gap-2 px-4 py-3 font-semibold">
                <i :class="srv.icon" class="text-pink-600 dark:text-pink-400" />
                {{ srv.name }}
                <code class="text-xs font-normal text-zinc-500 dark:text-zinc-400">/mcp/{{ srv.slug }}</code>
                <span class="ml-auto text-xs font-normal text-zinc-400">{{ srv.tools.length }} tools</span>
                <i class="mdi mdi-chevron-down transition group-open:rotate-180" />
              </summary>
              <div class="overflow-x-auto border-t border-zinc-200 dark:border-zinc-700">
                <table class="w-full text-sm">
                  <tbody>
                    <tr
                      v-for="tool in srv.tools"
                      :key="tool.name"
                      class="border-t first:border-t-0 border-zinc-200 dark:border-zinc-700 align-top"
                    >
                      <td class="px-3 py-2 whitespace-nowrap">
                        <code class="text-xs">{{ tool.name }}</code>
                        <span class="ml-1 rounded px-1 py-0.5 text-[10px] font-semibold" :class="mcpKinds[tool.kind].class">
                          {{ mcpKinds[tool.kind].label }}
                        </span>
                      </td>
                      <td class="px-3 py-2">
                        <p class="font-medium">{{ tool.title }}</p>
                        <p class="text-xs text-zinc-500 dark:text-zinc-400">{{ tool.description }}</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </details>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { APPI_BASE_URL, accessLabels, appiModules, type ApiModule } from '~/data/appiDocs'
import { appiMcpServers, type McpToolKind } from '~/data/appiMcp'

function countEndpoints(mod: ApiModule) {
  return mod.groups.reduce((total, group) => total + group.endpoints.length, 0)
}

const curlExample = `curl ${APPI_BASE_URL}/content/posts?per_page=5 \\
  -H "x-site-id: $APPI_SITE_ID" \\
  -H "Accept: application/json"`

const proxyExample = `// .env → APPI_URL=${APPI_BASE_URL}  APPI_SITE_ID=<tu-site-id>
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const token = getCookie(event, 'appi_token')
  const path = event.context.params?.path ?? ''
  const method = event.method

  return await $fetch(\`/\${path}\`, {
    baseURL: config.appiUrl,
    method,
    query: getQuery(event),
    body: ['POST', 'PUT', 'PATCH'].includes(method) ? await readBody(event) : undefined,
    headers: {
      'x-site-id': config.appiSiteId,
      Accept: 'application/json',
      ...(token ? { Authorization: \`Bearer \${token}\` } : {}),
    },
  }).catch((error) => {
    throw createError({ statusCode: error.statusCode, data: error.data })
  })
})`

const loginExample = `export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { email, password } = await readBody(event)

  const { user, enrollment, token } = await $fetch<any>('/auth/login', {
    baseURL: config.appiUrl,
    method: 'POST',
    headers: { 'x-site-id': config.appiSiteId, Accept: 'application/json' },
    body: { email, password },
  })

  setCookie(event, 'appi_token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  // Nunca devuelvas el token al navegador
  return { user, enrollment }
})`

const paginationExample = `{
  "meta": {
    "total": 42,
    "perPage": 10,
    "currentPage": 1,
    "lastPage": 5,
    "firstPage": 1
  },
  "data": [ … ]
}`

const errorExample = `HTTP/1.1 400 Bad Request
{ "message": "El cupón ha expirado." }`

const validationExample = `HTTP/1.1 422 Unprocessable Entity
{
  "errors": [
    { "field": "email", "rule": "email", "message": "The email field must be a valid email address" }
  ]
}`

const errorRows = [
  { code: '400', text: 'Petición inválida para el estado actual (cupón vencido, curso sin autoinscripción, email sin verificar, siteId inválido…). Revisa message.' },
  { code: '401', text: 'Falta el token o ya no es válido.' },
  { code: '403', text: 'Autenticado, pero sin el rol necesario (por ejemplo, rol de curso) o fuera de la ventana permitida.' },
  { code: '404', text: 'El recurso no existe, no pertenece a tu sitio o no es tuyo. Las rutas protegidas por rol de sitio también pueden responder 404 en lugar de 403.' },
  { code: '422', text: 'Error de validación del cuerpo o query: revisa errors[].field y errors[].message.' },
]

const securityTips = [
  'Llama a appi desde tu servidor y guarda el token en una cookie httpOnly, secure y sameSite. No lo pongas en localStorage ni en la URL.',
  'Nunca devuelvas el token al navegador ni lo registres en logs.',
  'Mantén las credenciales del owner fuera del frontend público. Si tu sitio necesita acciones de administración, constrúyelas en un panel aparte y protegido.',
  'No confíes en totales calculados en el cliente: appi recalcula precios y descuentos al crear un pedido.',
  'Confirma los pagos con tu pasarela desde tu servidor (webhooks) antes de marcarlos como completados.',
  'Valida en tu frontend lo que muestres como HTML: si un post o lección usa formato html, sanitízalo antes de renderizarlo.',
  'Llama a /auth/logout cuando el usuario cierre sesión para revocar el token, además de borrar la cookie.',
]

const mcpModuleSlugs = appiMcpServers.map((srv) => srv.slug).join(' ')

const mcpLoginExample = `curl ${APPI_BASE_URL}/auth/login \\
  -H "x-site-id: $APPI_SITE_ID" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -d '{"email": "tu@correo.com", "password": "…"}'

# → { "user": { … }, "enrollment": { … }, "token": "oat_…" }`

const mcpClaudeCodeExample = `# Un módulo, modo varios sitios
claude mcp add --transport http --scope user appi-content \\
  ${APPI_BASE_URL}/mcp/content \\
  --header "Authorization: Bearer $APPI_TOKEN"

# Todos los módulos de una vez
for m in ${mcpModuleSlugs}; do
  claude mcp add --transport http --scope user "appi-$m" \\
    "${APPI_BASE_URL}/mcp/$m" \\
    --header "Authorization: Bearer $APPI_TOKEN"
done

# Modo un sitio fijo
claude mcp add --transport http --scope user mitienda-store \\
  ${APPI_BASE_URL}/mcp/<siteId>/store \\
  --header "Authorization: Bearer $APPI_TOKEN"`

const mcpJsonExample = `{
  "mcpServers": {
    "appi-content": {
      "type": "http",
      "url": "${APPI_BASE_URL}/mcp/content",
      "headers": { "Authorization": "Bearer \${APPI_TOKEN}" }
    }
  }
}`

const mcpDesktopExample = `{
  "mcpServers": {
    "appi-content": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "${APPI_BASE_URL}/mcp/content",
        "--header",
        "Authorization:\${APPI_AUTH}"
      ],
      "env": { "APPI_AUTH": "Bearer oat_…" }
    }
  }
}`

const mcpConversationExample = `Tú:      Publica un borrador con el resumen de la reunión.
Claude:  (list_my_sites) Tienes acceso a "Droni" (owner) y "Mi tienda" (owner).
         ¿En cuál lo creo?
Tú:      En Droni.
Claude:  (admin_create_post, site_id: <Droni>) Listo, quedó como borrador.
Tú:      Ahora muéstrame los pedidos pendientes de Mi tienda.
Claude:  (admin_list_orders, site_id: <Mi tienda>, status: pending) …`

const mcpNotes = [
  'Las tools admin_* requieren rol owner en el sitio; las teacher_* (servidor learn), rol teacher o admin en el curso (las de eliminar, solo admin). Si no tienes el rol, el asistente recibe el error y te lo explica.',
  'Los errores de la API (401, 403, 404, 422) llegan al asistente con su mensaje, así que puede corregir los datos y reintentar.',
  'Las actualizaciones son parciales: solo cambian los campos que el asistente envía.',
  'Los comentarios y topics nuevos quedan ocultos hasta que un owner los aprueba, igual que desde la API.',
  'create_order y register_payment piden al asistente confirmar contigo antes de ejecutarse. Aun así, revisa lo que vas a aprobar.',
  'La subida de archivos (multipart) y las importaciones masivas no están disponibles por MCP; usa la API o drodmin.',
]

const mcpKinds: Record<McpToolKind, { label: string, description: string, class: string }> = {
  read: { label: 'lectura', description: 'solo consulta', class: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  write: { label: 'escritura', description: 'crea o modifica', class: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  destructive: { label: 'borra', description: 'elimina datos', class: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' },
}

useSeoMeta({
  title: 'Appi · Documentación para desarrolladores | Droni.co',
  ogTitle: 'Appi · Documentación para desarrolladores | Droni.co',
  description: 'Construye tu propio sitio sobre appi: autenticación, contenido, comunidad, tienda y cursos vía API.',
  ogDescription: 'Construye tu propio sitio sobre appi: autenticación, contenido, comunidad, tienda y cursos vía API.',
})
</script>
