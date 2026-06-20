<template>
  <div class="flex bg-zinc-50 dark:bg-zinc-900">
    <!-- Left section -->
    <section class="w-1/2 flex flex-col border-r border-slate-300 dark:border-slate-700">
      <!-- Input subsection -->
      <div class="flex flex-col flex-shrink-0">
        <header class="flex items-center justify-between p-4 border-b border-slate-300 dark:border-slate-700">
          <h2 class="font-bold text-lg">JWT Input</h2>
          <DuiButton
            size="sm"
            variant="outline"
            @click="clearInput"
          >
            <i class="mdi mdi-close" />
            Limpiar
          </DuiButton>
        </header>
        <div class="p-4">
          <textarea
            v-model="jwtInput"
            placeholder="Pega tu JWT aquí..."
            class="w-full h-56 resize-none rounded-lg p-3 font-mono text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-zinc-400 dark:placeholder-zinc-500"
          />
        </div>
      </div>

      <!-- Article subsection -->
      <article class="px-6 pb-10 flex flex-col gap-8 text-zinc-700 dark:text-zinc-300">

        <!-- Qué es un JWT -->
        <section>
          <div class="flex items-center gap-3 mb-3">
            <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
              <i class="mdi mdi-information text-lg" />
            </span>
            <h2 class="text-xl font-bold text-zinc-900 dark:text-zinc-50">¿Qué es un JWT?</h2>
          </div>
          <p class="text-sm leading-relaxed">
            Un <strong class="text-zinc-900 dark:text-zinc-100">JSON Web Token (JWT)</strong> es un estándar abierto (<a class="text-indigo-600 dark:text-indigo-400 underline" href="https://datatracker.ietf.org/doc/html/rfc7519" target="_blank" rel="noopener">RFC 7519</a>) que define una forma compacta y autocontenida de transmitir información entre partes como un objeto JSON. La información puede verificarse porque está firmada digitalmente, ya sea con un secreto (HMAC) o con un par de claves pública/privada (RSA o ECDSA).
          </p>
          <p class="text-sm leading-relaxed mt-2">
            Un JWT tiene la forma <code class="font-mono bg-zinc-100 dark:bg-zinc-800 px-1 rounded text-xs">xxxxx.yyyyy.zzzzz</code>, donde cada sección está codificada en Base64URL y separada por un punto.
          </p>
        </section>

        <!-- Para qué se usa -->
        <section>
          <div class="flex items-center gap-3 mb-3">
            <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
              <i class="mdi mdi-lightning-bolt text-lg" />
            </span>
            <h2 class="text-xl font-bold text-zinc-900 dark:text-zinc-50">¿Para qué se usa?</h2>
          </div>
          <ul class="text-sm leading-relaxed flex flex-col gap-2">
            <li class="flex gap-2">
              <i class="mdi mdi-check-circle text-blue-500 mt-0.5 flex-shrink-0" />
              <span><strong class="text-zinc-900 dark:text-zinc-100">Autenticación:</strong> tras el login, el servidor emite un JWT que el cliente adjunta en cada petición para demostrar su identidad, sin consultar la base de datos en cada request.</span>
            </li>
            <li class="flex gap-2">
              <i class="mdi mdi-check-circle text-blue-500 mt-0.5 flex-shrink-0" />
              <span><strong class="text-zinc-900 dark:text-zinc-100">Autorización:</strong> el token puede incluir roles y permisos del usuario para que el servidor decida qué recursos puede acceder.</span>
            </li>
            <li class="flex gap-2">
              <i class="mdi mdi-check-circle text-blue-500 mt-0.5 flex-shrink-0" />
              <span><strong class="text-zinc-900 dark:text-zinc-100">Intercambio de información:</strong> al estar firmado, cualquier sistema receptor puede verificar que el contenido no fue alterado en tránsito.</span>
            </li>
            <li class="flex gap-2">
              <i class="mdi mdi-check-circle text-blue-500 mt-0.5 flex-shrink-0" />
              <span><strong class="text-zinc-900 dark:text-zinc-100">Single Sign-On (SSO):</strong> su pequeño tamaño y portabilidad lo hacen ideal para sistemas federados donde múltiples servicios comparten autenticación.</span>
            </li>
          </ul>
        </section>

        <!-- Partes del token -->
        <section>
          <div class="flex items-center gap-3 mb-3">
            <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400">
              <i class="mdi mdi-puzzle text-lg" />
            </span>
            <h2 class="text-xl font-bold text-zinc-900 dark:text-zinc-50">Las tres partes</h2>
          </div>
          <div class="flex flex-col gap-3 text-sm">
            <div class="flex gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
              <span class="w-2 h-2 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
              <div>
                <p class="font-semibold text-purple-700 dark:text-purple-300">Header</p>
                <p class="text-zinc-600 dark:text-zinc-400 mt-0.5">Indica el tipo de token (<code class="font-mono text-xs">JWT</code>) y el algoritmo de firma usado (<code class="font-mono text-xs">HS256</code>, <code class="font-mono text-xs">RS256</code>, etc.).</p>
              </div>
            </div>
            <div class="flex gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <span class="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
              <div>
                <p class="font-semibold text-blue-700 dark:text-blue-300">Payload</p>
                <p class="text-zinc-600 dark:text-zinc-400 mt-0.5">Contiene los <em>claims</em>: datos del usuario y metadatos del token como <code class="font-mono text-xs">iat</code> (emitido), <code class="font-mono text-xs">exp</code> (expiración) y <code class="font-mono text-xs">sub</code> (sujeto).</p>
              </div>
            </div>
            <div class="flex gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <span class="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
              <div>
                <p class="font-semibold text-amber-700 dark:text-amber-300">Signature</p>
                <p class="text-zinc-600 dark:text-zinc-400 mt-0.5">El resultado de firmar <code class="font-mono text-xs">base64(header) + "." + base64(payload)</code> con la clave secreta. Garantiza integridad.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Beneficios -->
        <section>
          <div class="flex items-center gap-3 mb-3">
            <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400">
              <i class="mdi mdi-star text-lg" />
            </span>
            <h2 class="text-xl font-bold text-zinc-900 dark:text-zinc-50">Beneficios</h2>
          </div>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div class="p-3 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-slate-700">
              <p class="font-semibold text-zinc-900 dark:text-zinc-100 mb-1"><i class="mdi mdi-server-off text-green-500 mr-1" />Sin estado</p>
              <p class="text-zinc-500 dark:text-zinc-400 text-xs">El servidor no necesita almacenar sesiones. Toda la info viaja en el token.</p>
            </div>
            <div class="p-3 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-slate-700">
              <p class="font-semibold text-zinc-900 dark:text-zinc-100 mb-1"><i class="mdi mdi-scale-balance text-green-500 mr-1" />Escalable</p>
              <p class="text-zinc-500 dark:text-zinc-400 text-xs">Ideal para microservicios y arquitecturas distribuidas donde múltiples servidores deben autenticar.</p>
            </div>
            <div class="p-3 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-slate-700">
              <p class="font-semibold text-zinc-900 dark:text-zinc-100 mb-1"><i class="mdi mdi-web text-green-500 mr-1" />Multiplataforma</p>
              <p class="text-zinc-500 dark:text-zinc-400 text-xs">Funciona en web, móvil e IoT. JSON es universal; Base64URL es seguro para URLs.</p>
            </div>
            <div class="p-3 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-slate-700">
              <p class="font-semibold text-zinc-900 dark:text-zinc-100 mb-1"><i class="mdi mdi-shield-check text-green-500 mr-1" />Seguro</p>
              <p class="text-zinc-500 dark:text-zinc-400 text-xs">La firma criptográfica garantiza que el contenido no puede alterarse sin invalidar el token.</p>
            </div>
          </div>
        </section>

        <!-- Claims estándar -->
        <section>
          <div class="flex items-center gap-3 mb-3">
            <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              <i class="mdi mdi-tag-multiple text-lg" />
            </span>
            <h2 class="text-xl font-bold text-zinc-900 dark:text-zinc-50">Claims estándar</h2>
          </div>
          <div class="text-sm overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
            <table class="w-full">
              <thead class="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th class="text-left px-4 py-2 font-semibold text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 w-20">Claim</th>
                  <th class="text-left px-4 py-2 font-semibold text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Significado</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
                <tr v-for="claim in standardClaims" :key="claim.key" class="bg-white dark:bg-zinc-900">
                  <td class="px-4 py-2 font-mono text-xs text-indigo-600 dark:text-indigo-400">{{ claim.key }}</td>
                  <td class="px-4 py-2 text-zinc-600 dark:text-zinc-400 text-xs">{{ claim.desc }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Datos curiosos -->
        <section>
          <div class="flex items-center gap-3 mb-3">
            <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400">
              <i class="mdi mdi-lightbulb text-lg" />
            </span>
            <h2 class="text-xl font-bold text-zinc-900 dark:text-zinc-50">Datos curiosos</h2>
          </div>
          <ul class="flex flex-col gap-3 text-sm">
            <li class="flex gap-3 p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
              <i class="mdi mdi-numeric-1-circle text-rose-500 text-xl flex-shrink-0" />
              <span class="text-zinc-700 dark:text-zinc-300"><strong class="text-zinc-900 dark:text-zinc-100">No es cifrado, es firmado.</strong> El payload de un JWT es solo Base64URL, cualquiera puede leerlo. Nunca guardes contraseñas o datos sensibles en él sin cifrar.</span>
            </li>
            <li class="flex gap-3 p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
              <i class="mdi mdi-numeric-2-circle text-rose-500 text-xl flex-shrink-0" />
              <span class="text-zinc-700 dark:text-zinc-300"><strong class="text-zinc-900 dark:text-zinc-100">Se pronuncia "jot".</strong> El RFC 7519 lo establece explícitamente. Decir "jay-double-u-tee" es técnicamente incorrecto (aunque todos lo entiendan).</span>
            </li>
            <li class="flex gap-3 p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
              <i class="mdi mdi-numeric-3-circle text-rose-500 text-xl flex-shrink-0" />
              <span class="text-zinc-700 dark:text-zinc-300"><strong class="text-zinc-900 dark:text-zinc-100">No se pueden invalidar fácilmente.</strong> Al ser stateless, revocar un JWT antes de su expiración requiere implementar una lista negra (blocklist), lo que añade estado al servidor.</span>
            </li>
            <li class="flex gap-3 p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
              <i class="mdi mdi-numeric-4-circle text-rose-500 text-xl flex-shrink-0" />
              <span class="text-zinc-700 dark:text-zinc-300"><strong class="text-zinc-900 dark:text-zinc-100">El algoritmo <code class="font-mono text-xs">none</code> existe y es peligroso.</strong> Algunas librerías antiguas aceptaban tokens con <code class="font-mono text-xs">"alg": "none"</code> sin firma, permitiendo ataques de suplantación.</span>
            </li>
            <li class="flex gap-3 p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
              <i class="mdi mdi-numeric-5-circle text-rose-500 text-xl flex-shrink-0" />
              <span class="text-zinc-700 dark:text-zinc-300"><strong class="text-zinc-900 dark:text-zinc-100">El tamaño importa.</strong> Un JWT típico pesa entre 200 y 500 bytes. Se envía en cada request, así que un payload muy grande puede degradar el rendimiento perceptiblemente a escala.</span>
            </li>
          </ul>
        </section>

      </article>
    </section>

    <!-- Right section -->
    <section class="w-1/2 flex flex-col sticky top-0 h-screen bg-white dark:bg-zinc-800 overflow-y-auto">
      <header class="flex items-center justify-between p-4 border-b border-slate-300 dark:border-slate-700 sticky top-0 bg-white dark:bg-zinc-800 z-10">
        <h2 class="font-bold text-lg">JWT Decodificado</h2>
      </header>

      <!-- Error state -->
      <div v-if="decodeError" class="m-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
        <p class="text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
          <i class="mdi mdi-alert-circle" />
          {{ decodeError }}
        </p>
      </div>

      <!-- Empty state -->
      <div v-else-if="!jwtInput.trim()" class="flex flex-col items-center justify-center flex-1 text-zinc-400 dark:text-zinc-500 gap-3">
        <i class="mdi mdi-shield-key-outline text-5xl" />
        <p class="text-sm">Pega un JWT en el panel izquierdo para decodificarlo</p>
      </div>

      <!-- Decoded sections -->
      <div v-else-if="decoded" class="p-4 flex flex-col gap-4">
        <!-- Header -->
        <div class="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div class="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/30 border-b border-slate-200 dark:border-slate-700">
            <span class="w-2 h-2 rounded-full bg-purple-500" />
            <h3 class="font-semibold text-sm text-purple-700 dark:text-purple-300 uppercase tracking-wide">Header</h3>
          </div>
          <div class="p-4">
            <pre class="font-mono text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap break-all">{{ formatJson(decoded.header) }}</pre>
          </div>
        </div>

        <!-- Payload -->
        <div class="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div class="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 border-b border-slate-200 dark:border-slate-700">
            <span class="w-2 h-2 rounded-full bg-blue-500" />
            <h3 class="font-semibold text-sm text-blue-700 dark:text-blue-300 uppercase tracking-wide">Payload</h3>
          </div>
          <div class="p-4">
            <pre class="font-mono text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap break-all">{{ formatJson(decoded.payload) }}</pre>
            <!-- Timestamps legibles -->
            <div v-if="timestamps.length" class="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-col gap-1">
              <p v-for="ts in timestamps" :key="ts.key" class="text-xs text-zinc-500 dark:text-zinc-400">
                <span class="font-semibold">{{ ts.key }}:</span> {{ ts.date }}
              </p>
            </div>
          </div>
        </div>

        <!-- Signature -->
        <div class="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div class="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/30 border-b border-slate-200 dark:border-slate-700">
            <span class="w-2 h-2 rounded-full bg-amber-500" />
            <h3 class="font-semibold text-sm text-amber-700 dark:text-amber-300 uppercase tracking-wide">Signature</h3>
          </div>
          <div class="p-4 flex flex-col gap-2">
            <p class="font-mono text-sm text-zinc-800 dark:text-zinc-200 break-all">{{ decoded.signature }}</p>
            <p class="text-xs text-zinc-400 dark:text-zinc-500">
              <i class="mdi mdi-information-outline" />
              La firma no puede verificarse sin la clave secreta.
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { DuiButton } from '@dronico/droni-kit'

useSeoMeta({
  title: 'Decodificar JWT | Droni.co',
  ogTitle: 'Decodificar JWT | Droni.co',
  description: 'Decodifica y visualiza el contenido de un JSON Web Token (JWT) de forma rápida y sencilla.',
  ogDescription: 'Decodifica y visualiza el contenido de un JSON Web Token (JWT) de forma rápida y sencilla.',
  ogImage: 'https://dronico.nyc3.digitaloceanspaces.com/4ebaccf5-b863-4f12-aa49-9bbe0e1844e2/db7d4d54-7354-4421-9682-d1b75b1f1413/74529-dronico-card.png.png',
  twitterCard: 'summary_large_image',
  ogUrl: 'https://droni.co/codelab/decode-jwt'
})

const jwtInput = ref('')
const decodeError = ref('')

interface DecodedJwt {
  header: Record<string, unknown>
  payload: Record<string, unknown>
  signature: string
}

const decoded = ref<DecodedJwt | null>(null)

const TIMESTAMP_KEYS = ['iat', 'exp', 'nbf', 'auth_time', 'updated_at']

const standardClaims = [
  { key: 'iss', desc: 'Issuer — quién emitió el token' },
  { key: 'sub', desc: 'Subject — identificador del usuario o entidad' },
  { key: 'aud', desc: 'Audience — destinatario(s) para quien fue emitido' },
  { key: 'exp', desc: 'Expiration time — cuándo expira (Unix timestamp)' },
  { key: 'nbf', desc: 'Not before — no válido antes de esta fecha' },
  { key: 'iat', desc: 'Issued at — cuándo fue emitido (Unix timestamp)' },
  { key: 'jti', desc: 'JWT ID — identificador único del token' },
]

const timestamps = computed(() => {
  if (!decoded.value?.payload) return []
  return TIMESTAMP_KEYS
    .filter((k) => typeof decoded.value!.payload[k] === 'number')
    .map((k) => ({
      key: k,
      date: new Date((decoded.value!.payload[k] as number) * 1000).toLocaleString()
    }))
})

function base64UrlDecode(str: string): string {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  return atob(padded)
}

function decodeJwt(token: string) {
  decodeError.value = ''
  decoded.value = null

  const trimmed = token.trim()
  if (!trimmed) return

  const parts = trimmed.split('.')
  if (parts.length !== 3) {
    decodeError.value = 'JWT inválido: debe tener exactamente 3 partes separadas por puntos.'
    return
  }

  try {
    const header = JSON.parse(base64UrlDecode(parts[0]))
    const payload = JSON.parse(base64UrlDecode(parts[1]))
    decoded.value = { header, payload, signature: parts[2] }
  } catch {
    decodeError.value = 'Error al decodificar el JWT. Verifica que el token sea válido.'
  }
}

function formatJson(obj: unknown): string {
  return JSON.stringify(obj, null, 2)
}

function clearInput() {
  jwtInput.value = ''
  decoded.value = null
  decodeError.value = ''
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(jwtInput, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => decodeJwt(val), 300)
})

onBeforeUnmount(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
})
</script>
