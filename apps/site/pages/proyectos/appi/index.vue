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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { APPI_BASE_URL, accessLabels, appiModules, type ApiModule } from '~/data/appiDocs'

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

useSeoMeta({
  title: 'Appi · Documentación para desarrolladores | Droni.co',
  ogTitle: 'Appi · Documentación para desarrolladores | Droni.co',
  description: 'Construye tu propio sitio sobre appi: autenticación, contenido, comunidad, tienda y cursos vía API.',
  ogDescription: 'Construye tu propio sitio sobre appi: autenticación, contenido, comunidad, tienda y cursos vía API.',
})
</script>
