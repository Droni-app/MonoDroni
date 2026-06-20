<template>
  <div class="flex h-screen bg-zinc-50 dark:bg-zinc-900">

    <!-- Left: JSON input -->
    <section class="w-1/2 flex flex-col h-full border-r border-slate-300 dark:border-slate-700">
      <header class="flex items-center justify-between px-4 py-2 border-b border-slate-300 dark:border-slate-700 bg-zinc-50 dark:bg-zinc-900 flex-shrink-0">
        <h2 class="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Swagger / OpenAPI JSON</h2>
        <div class="flex items-center gap-2">
          <span v-if="parseError" class="text-xs text-red-500 max-w-[200px] truncate" :title="parseError">
            <i class="mdi mdi-alert-circle" /> {{ parseError }}
          </span>
          <span v-else-if="parsedSpec" class="text-xs text-emerald-500">
            <i class="mdi mdi-check-circle" /> OpenAPI {{ parsedSpec.version }}
          </span>
          <button
            v-if="swaggerInput"
            class="text-xs px-2 py-1 rounded border border-slate-300 dark:border-slate-600 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
            @click="swaggerInput = ''"
          >
            <i class="mdi mdi-close" /> Limpiar
          </button>
        </div>
      </header>
      <ClientOnly fallback-tag="div" fallback="Cargando editor...">
        <MonacoEditor
          v-model="swaggerInput"
          :lang="inputLang"
          class="flex-1"
          :options="{ theme: 'vs-dark', fontSize: 13, minimap: { enabled: false }, scrollBeyondLastLine: false, wordWrap: 'on', formatOnPaste: true, formatOnType: false }"
        />
      </ClientOnly>
    </section>

    <!-- Right: Swagger viewer -->
    <section class="w-1/2 flex flex-col h-full bg-white dark:bg-zinc-800 overflow-hidden">

      <!-- Empty / error state -->
      <div v-if="!parsedSpec" class="flex flex-col items-center justify-center flex-1 text-zinc-400 dark:text-zinc-500 gap-4 p-8">
        <i class="mdi mdi-api text-7xl" />
        <p class="text-sm text-center">Pega un JSON de Swagger u OpenAPI en el panel izquierdo</p>
        <p v-if="parseError" class="text-xs text-red-400 text-center font-mono bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg max-w-sm">
          {{ parseError }}
        </p>
      </div>

      <template v-else>

        <!-- API info header -->
        <div class="flex-shrink-0 px-5 py-3 border-b border-slate-200 dark:border-slate-700 bg-indigo-50 dark:bg-indigo-950/40">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <h1 class="font-bold text-base text-slate-800 dark:text-slate-100 truncate">{{ parsedSpec.info.title }}</h1>
              <p v-if="parsedSpec.info.description" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                {{ parsedSpec.info.description }}
              </p>
            </div>
            <span class="shrink-0 text-xs font-mono px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
              v{{ parsedSpec.info.version }}
            </span>
          </div>
          <div class="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            <a
              v-for="srv in parsedSpec.servers"
              :key="srv"
              :href="srv"
              target="_blank"
              rel="noopener noreferrer"
              class="text-xs font-mono text-indigo-600 dark:text-indigo-400 hover:underline truncate max-w-full"
            >{{ srv }}</a>
          </div>
          <p class="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
            {{ parsedSpec.endpoints.length }} rutas · {{ parsedSpec.tags.length }} grupos
          </p>
        </div>

        <!-- Search + method filters -->
        <div class="flex-shrink-0 flex items-center gap-2 px-3 py-2 border-b border-slate-200 dark:border-slate-700 bg-zinc-50 dark:bg-zinc-900">
          <div class="relative flex-1 min-w-0">
            <i class="mdi mdi-magnify absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
            <input
              v-model="search"
              type="text"
              placeholder="Buscar ruta, método o descripción..."
              class="w-full pl-7 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
          </div>
          <div class="flex gap-1 shrink-0">
            <button
              v-for="m in METHODS"
              :key="m"
              type="button"
              class="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded transition-opacity"
              :class="[methodBadgeClass(m), methodFilter.includes(m) ? 'opacity-100' : 'opacity-35']"
              @click="toggleMethodFilter(m)"
            >{{ m }}</button>
          </div>
        </div>

        <!-- Endpoint groups -->
        <div class="flex-1 overflow-y-auto">
          <p v-if="filteredEndpoints.length === 0" class="flex flex-col items-center justify-center h-32 text-zinc-400 text-sm gap-2">
            <i class="mdi mdi-magnify-remove-outline text-3xl" />
            Sin resultados
          </p>

          <div
            v-for="tag in filteredTags"
            :key="tag"
            class="border-b border-slate-200 dark:border-slate-700 last:border-b-0"
          >
            <!-- Tag header -->
            <button
              type="button"
              class="w-full flex items-center gap-2 px-4 py-2.5 text-left bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-850 transition-colors"
              @click="toggleTag(tag)"
            >
              <i :class="openTags.has(tag) ? 'mdi mdi-chevron-down' : 'mdi mdi-chevron-right'" class="text-slate-400 text-sm" />
              <span class="font-semibold text-sm text-slate-700 dark:text-slate-300">{{ tag }}</span>
              <span class="text-xs text-slate-400">({{ endpointsByTag[tag]?.length ?? 0 }})</span>
            </button>

            <!-- Endpoints within tag -->
            <template v-if="openTags.has(tag)">
              <div
                v-for="ep in endpointsByTag[tag]"
                :key="`${ep.method}-${ep.path}`"
                class="border-t border-slate-100 dark:border-slate-700/50"
              >
                <!-- Endpoint row (collapsed) -->
                <div
                  class="w-full flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-700/40 transition-colors"
                  @click="toggleEndpoint(ep.method + ep.path)"
                >
                  <span
                    class="shrink-0 text-[10px] font-mono font-bold px-2 py-0.5 rounded w-14 text-center"
                    :class="methodBadgeClass(ep.method)"
                  >{{ ep.method }}</span>
                  <span class="font-mono text-sm text-slate-800 dark:text-slate-200 flex-1 truncate">{{ ep.path }}</span>
                  <span class="text-xs text-slate-400 dark:text-slate-500 truncate max-w-[180px] hidden xl:block">{{ ep.summary }}</span>
                  <button
                    type="button"
                    class="shrink-0 p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-zinc-600 transition-colors"
                    :title="copiedCurl === ep.method + ep.path ? '¡Copiado!' : 'Copiar cURL'"
                    @click.stop="copyCurl(ep)"
                  >
                    <i
                      class="mdi text-sm"
                      :class="copiedCurl === ep.method + ep.path ? 'mdi-check text-emerald-500' : 'mdi-console'"
                    />
                  </button>
                  <i
                    class="mdi shrink-0 text-slate-400 text-sm"
                    :class="openEndpoints.has(ep.method + ep.path) ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                  />
                </div>

                <!-- Endpoint details (expanded) -->
                <div v-if="openEndpoints.has(ep.method + ep.path)" class="px-4 pb-5 pt-1 bg-slate-50/50 dark:bg-zinc-800/60 border-t border-slate-100 dark:border-slate-700/50">

                  <p v-if="ep.summary" class="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">{{ ep.summary }}</p>
                  <p v-if="ep.description && ep.description !== ep.summary" class="text-xs text-slate-500 dark:text-slate-400 mb-3 whitespace-pre-line">{{ ep.description }}</p>

                  <!-- Parameters -->
                  <div v-if="ep.parameters.length" class="mb-4">
                    <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Parámetros</h4>
                    <div class="rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden">
                      <table class="w-full text-xs">
                        <thead>
                          <tr class="bg-slate-100 dark:bg-zinc-700">
                            <th class="text-left px-3 py-2 text-slate-500 dark:text-slate-400 font-medium">Nombre</th>
                            <th class="text-left px-3 py-2 text-slate-500 dark:text-slate-400 font-medium">Ubicación</th>
                            <th class="text-left px-3 py-2 text-slate-500 dark:text-slate-400 font-medium">Tipo</th>
                            <th class="text-left px-3 py-2 text-slate-500 dark:text-slate-400 font-medium text-center">Req.</th>
                            <th class="text-left px-3 py-2 text-slate-500 dark:text-slate-400 font-medium">Descripción</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="param in ep.parameters"
                            :key="param.name + param.in"
                            class="border-t border-slate-100 dark:border-slate-600 hover:bg-white dark:hover:bg-zinc-700/30"
                          >
                            <td class="px-3 py-2 font-mono font-semibold text-slate-800 dark:text-slate-200">{{ param.name }}</td>
                            <td class="px-3 py-2">
                              <span class="text-[10px] font-mono px-1.5 py-0.5 rounded font-medium" :class="paramInClass(param.in)">{{ param.in }}</span>
                            </td>
                            <td class="px-3 py-2 font-mono text-slate-500 dark:text-slate-400">{{ schemaTypeLabel(param.schema) }}</td>
                            <td class="px-3 py-2 text-center">
                              <i v-if="param.required" class="mdi mdi-check-circle text-emerald-500" />
                              <i v-else class="mdi mdi-circle-outline text-slate-300 dark:text-slate-600" />
                            </td>
                            <td class="px-3 py-2 text-slate-500 dark:text-slate-400">{{ param.description }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <!-- Request Body -->
                  <div v-if="ep.requestBody" class="mb-4">
                    <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      Request Body<span v-if="ep.requestBodyRequired" class="text-red-500 ml-1">*</span>
                    </h4>
                    <div v-for="(mediaObj, mediaType) in ep.requestBody" :key="mediaType" class="mb-2">
                      <p class="text-[10px] font-mono text-slate-400 dark:text-slate-500 mb-1">{{ mediaType }}</p>
                      <pre v-if="mediaObj.schema" class="text-xs font-mono bg-zinc-900 text-emerald-300 rounded-lg p-3 overflow-x-auto whitespace-pre leading-relaxed">{{ renderSchema(mediaObj.schema) }}</pre>
                    </div>
                  </div>

                  <!-- Responses -->
                  <div v-if="ep.responses.length">
                    <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Respuestas</h4>
                    <div class="space-y-2">
                      <div
                        v-for="resp in ep.responses"
                        :key="resp.status"
                        class="rounded-lg border overflow-hidden"
                        :class="responseStatusBorder(resp.status)"
                      >
                        <div class="flex items-center gap-2 px-3 py-1.5" :class="responseStatusBg(resp.status)">
                          <span class="font-mono font-bold text-xs" :class="responseStatusText(resp.status)">{{ resp.status }}</span>
                          <span class="text-xs text-slate-600 dark:text-slate-300">{{ resp.description }}</span>
                        </div>
                        <pre v-if="resp.schema" class="text-xs font-mono bg-zinc-900 text-emerald-300 p-3 overflow-x-auto whitespace-pre leading-relaxed rounded-t-none border-t border-slate-200 dark:border-slate-600">{{ renderSchema(resp.schema) }}</pre>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </template>
          </div>
        </div>
      </template>
    </section>
  </div>
</template>

<script setup lang="ts">
import { load as yamlLoad } from 'js-yaml'

useSeoMeta({
  title: 'Visor Swagger | Droni.co',
  ogTitle: 'Visor Swagger | Droni.co',
  description: 'Visualiza y explora documentación Swagger y OpenAPI. Inspecciona rutas, parámetros, esquemas y respuestas de forma clara.',
  ogDescription: 'Visualiza y explora documentación Swagger y OpenAPI. Inspecciona rutas, parámetros, esquemas y respuestas de forma clara.',
  ogImage: 'https://dronico.nyc3.digitaloceanspaces.com/4ebaccf5-b863-4f12-aa49-9bbe0e1844e2/db7d4d54-7354-4421-9682-d1b75b1f1413/74529-dronico-card.png.png',
  twitterCard: 'summary_large_image',
  ogUrl: 'https://droni.co/codelab/swagger-viewer',
})

// ─── Raw spec types (OpenAPI 3.x / Swagger 2.x) ───────────────────────────────

interface JsonSchema {
  type?: string
  format?: string
  properties?: Record<string, JsonSchema>
  items?: JsonSchema
  required?: string[]
  enum?: unknown[]
  $ref?: string
  allOf?: JsonSchema[]
  oneOf?: JsonSchema[]
  anyOf?: JsonSchema[]
  description?: string
  nullable?: boolean
  minimum?: number
  minLength?: number
}

interface RawParameter {
  name?: string
  in?: string
  required?: boolean
  description?: string
  schema?: JsonSchema
  $ref?: string
  type?: string
  format?: string
  enum?: unknown[]
}

interface RawMediaObject {
  schema?: JsonSchema
}

interface RawRequestBody {
  required?: boolean
  content?: Record<string, RawMediaObject>
  $ref?: string
}

interface RawResponse {
  description?: string
  content?: Record<string, RawMediaObject>
  schema?: JsonSchema
}

interface RawOperation {
  tags?: string[]
  summary?: string
  description?: string
  operationId?: string
  parameters?: RawParameter[]
  requestBody?: RawRequestBody
  responses?: Record<string, RawResponse>
}

interface RawPathItem {
  parameters?: RawParameter[]
  get?: RawOperation
  post?: RawOperation
  put?: RawOperation
  patch?: RawOperation
  delete?: RawOperation
  head?: RawOperation
  options?: RawOperation
}

interface RawSpec {
  openapi?: string
  swagger?: string
  info?: { title?: string; version?: string; description?: string }
  servers?: Array<{ url?: string }>
  host?: string
  basePath?: string
  schemes?: string[]
  paths?: Record<string, RawPathItem>
  tags?: Array<{ name?: string } | string>
  components?: { schemas?: Record<string, JsonSchema> }
  definitions?: Record<string, JsonSchema>
}

// ─── Parsed output types ──────────────────────────────────────────────────────

interface ParsedSpec {
  version: string
  info: { title: string; version: string; description: string }
  servers: string[]
  tags: string[]
  endpoints: ParsedEndpoint[]
}

interface ParsedEndpoint {
  path: string
  method: string
  tag: string
  summary: string
  description: string
  operationId: string
  parameters: ParsedParam[]
  requestBody: Record<string, { schema: JsonSchema | null }> | null
  requestBodyRequired: boolean
  responses: ParsedResponse[]
}

interface ParsedParam {
  name: string
  in: string
  required: boolean
  description: string
  schema: JsonSchema | null
}

interface ParsedResponse {
  status: string
  description: string
  schema: JsonSchema | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

const SAMPLE_SWAGGER = `{
  "openapi": "3.0.0",
  "info": {
    "title": "API de ejemplo",
    "version": "1.0.0",
    "description": "Una API de ejemplo para explorar el Visor Swagger. Incluye gestión de usuarios y autenticación."
  },
  "servers": [
    { "url": "https://api.example.com/v1" }
  ],
  "paths": {
    "/auth/login": {
      "post": {
        "tags": ["Auth"],
        "summary": "Iniciar sesión",
        "description": "Autentica un usuario y devuelve un token JWT.",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["email", "password"],
                "properties": {
                  "email": { "type": "string", "format": "email", "description": "Correo del usuario" },
                  "password": { "type": "string", "minLength": 8 }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Login exitoso",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "token": { "type": "string" },
                    "user": { "$ref": "#/components/schemas/User" }
                  }
                }
              }
            }
          },
          "401": { "description": "Credenciales inválidas" }
        }
      }
    },
    "/users": {
      "get": {
        "tags": ["Usuarios"],
        "summary": "Listar usuarios",
        "parameters": [
          { "name": "page", "in": "query", "schema": { "type": "integer" }, "description": "Número de página" },
          { "name": "per_page", "in": "query", "schema": { "type": "integer" }, "description": "Elementos por página" },
          { "name": "q", "in": "query", "schema": { "type": "string" }, "description": "Búsqueda por nombre o email" },
          { "name": "Authorization", "in": "header", "required": true, "schema": { "type": "string" }, "description": "Bearer {token}" }
        ],
        "responses": {
          "200": {
            "description": "Lista paginada de usuarios",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "data": { "type": "array", "items": { "$ref": "#/components/schemas/User" } },
                    "meta": { "$ref": "#/components/schemas/PaginationMeta" }
                  }
                }
              }
            }
          },
          "401": { "description": "No autorizado" }
        }
      },
      "post": {
        "tags": ["Usuarios"],
        "summary": "Crear usuario",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/CreateUserRequest" }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Usuario creado",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/User" }
              }
            }
          },
          "422": { "description": "Error de validación" }
        }
      }
    },
    "/users/{id}": {
      "get": {
        "tags": ["Usuarios"],
        "summary": "Obtener usuario",
        "parameters": [
          { "name": "id", "in": "path", "required": true, "schema": { "type": "string", "format": "uuid" }, "description": "ID del usuario" }
        ],
        "responses": {
          "200": { "description": "Usuario encontrado", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/User" } } } },
          "404": { "description": "Usuario no encontrado" }
        }
      },
      "patch": {
        "tags": ["Usuarios"],
        "summary": "Actualizar usuario",
        "parameters": [
          { "name": "id", "in": "path", "required": true, "schema": { "type": "string", "format": "uuid" } }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "name": { "type": "string" },
                  "email": { "type": "string", "format": "email" },
                  "avatar": { "type": "string", "format": "uri", "nullable": true }
                }
              }
            }
          }
        },
        "responses": {
          "200": { "description": "Usuario actualizado", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/User" } } } },
          "404": { "description": "Usuario no encontrado" },
          "422": { "description": "Error de validación" }
        }
      },
      "delete": {
        "tags": ["Usuarios"],
        "summary": "Eliminar usuario",
        "parameters": [
          { "name": "id", "in": "path", "required": true, "schema": { "type": "string", "format": "uuid" } }
        ],
        "responses": {
          "204": { "description": "Eliminado correctamente" },
          "404": { "description": "Usuario no encontrado" }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "User": {
        "type": "object",
        "properties": {
          "id": { "type": "string", "format": "uuid" },
          "name": { "type": "string" },
          "email": { "type": "string", "format": "email" },
          "avatar": { "type": "string", "format": "uri", "nullable": true },
          "createdAt": { "type": "string", "format": "date-time" },
          "updatedAt": { "type": "string", "format": "date-time" }
        }
      },
      "CreateUserRequest": {
        "type": "object",
        "required": ["name", "email", "password"],
        "properties": {
          "name": { "type": "string" },
          "email": { "type": "string", "format": "email" },
          "password": { "type": "string", "minLength": 8 }
        }
      },
      "PaginationMeta": {
        "type": "object",
        "properties": {
          "total": { "type": "integer" },
          "perPage": { "type": "integer" },
          "currentPage": { "type": "integer" },
          "lastPage": { "type": "integer" }
        }
      }
    }
  }
}`

// ─── State ────────────────────────────────────────────────────────────────────

const swaggerInput = ref(SAMPLE_SWAGGER)
const parseError = ref('')

const inputLang = computed(() => {
  const t = swaggerInput.value.trimStart()
  return t.startsWith('{') || t.startsWith('[') ? 'json' : 'yaml'
})
const search = ref('')
const methodFilter = ref<string[]>([])
const openTags = ref(new Set<string>())
const openEndpoints = ref(new Set<string>())
const copiedCurl = ref<string | null>(null)

// ─── cURL generation ──────────────────────────────────────────────────────────

function sampleFromSchema(schema: JsonSchema | null, depth = 0): unknown {
  if (!schema || depth > 4) return null
  if (schema.type === 'object' || schema.properties) {
    const obj: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(schema.properties ?? {})) {
      obj[key] = sampleFromSchema(val, depth + 1)
    }
    return obj
  }
  if (schema.type === 'array') return [sampleFromSchema(schema.items ?? null, depth + 1)]
  if (schema.enum) return schema.enum[0]
  switch (schema.type) {
    case 'string':
      if (schema.format === 'email') return 'user@example.com'
      if (schema.format === 'uuid') return '00000000-0000-0000-0000-000000000000'
      if (schema.format === 'date-time') return '2024-01-01T00:00:00Z'
      if (schema.format === 'uri') return 'https://example.com'
      return 'string'
    case 'integer': return 0
    case 'number': return 0.0
    case 'boolean': return true
    default: return null
  }
}

function generateCurl(ep: ParsedEndpoint, servers: string[]): string {
  const base = (servers[0] ?? '').replace(/\/$/, '')
  const queryParams = ep.parameters.filter(p => p.in === 'query')
  const headerParams = ep.parameters.filter(p => p.in === 'header')

  let url = base + ep.path
  if (queryParams.length) {
    url += '?' + queryParams.map(p => `${p.name}={${p.name}}`).join('&')
  }

  const lines: string[] = [`curl -X ${ep.method} "${url}"`]

  for (const h of headerParams) {
    lines.push(`  -H "${h.name}: {${h.name}}"`)
  }

  if (ep.requestBody) {
    const [[contentType, mediaObj]] = Object.entries(ep.requestBody)
    lines.push(`  -H "Content-Type: ${contentType}"`)
    if (mediaObj?.schema) {
      const sample = sampleFromSchema(mediaObj.schema)
      lines.push(`  -d '${JSON.stringify(sample, null, 2)}'`)
    }
  }

  return lines.join(' \\\n')
}

async function copyCurl(ep: ParsedEndpoint) {
  const curl = generateCurl(ep, parsedSpec.value?.servers ?? [])
  await navigator.clipboard.writeText(curl)
  const key = ep.method + ep.path
  copiedCurl.value = key
  setTimeout(() => { if (copiedCurl.value === key) copiedCurl.value = null }, 2000)
}

// ─── Parsing ──────────────────────────────────────────────────────────────────

function resolveRef<T>(ref: string, rawSpec: RawSpec, depth = 0): T | null {
  if (depth > 6 || !ref.startsWith('#/')) return null
  const parts = ref.slice(2).split('/')
  let node: unknown = rawSpec
  for (const part of parts) {
    if (!node || typeof node !== 'object') return null
    node = (node as Record<string, unknown>)[part]
    if (node === undefined) return null
  }
  if (node && typeof node === 'object' && '$ref' in node) {
    return resolveRef<T>((node as { $ref: string }).$ref, rawSpec, depth + 1)
  }
  return node as T
}

function resolveSchemaRefs(schema: JsonSchema, rawSpec: RawSpec, depth = 0): JsonSchema {
  if (depth > 8) return schema
  if (schema.$ref) {
    const resolved = resolveRef<JsonSchema>(schema.$ref, rawSpec)
    if (!resolved) return { type: schema.$ref.split('/').pop() }
    return resolveSchemaRefs(resolved, rawSpec, depth + 1)
  }
  const out: JsonSchema = { ...schema }
  if (out.properties) {
    const props: Record<string, JsonSchema> = {}
    for (const [k, v] of Object.entries(out.properties)) {
      props[k] = resolveSchemaRefs(v, rawSpec, depth + 1)
    }
    out.properties = props
  }
  if (out.items) out.items = resolveSchemaRefs(out.items, rawSpec, depth + 1)
  for (const key of ['allOf', 'oneOf', 'anyOf'] as const) {
    const arr = out[key]
    if (Array.isArray(arr)) {
      out[key] = arr.map(s => resolveSchemaRefs(s, rawSpec, depth + 1))
    }
  }
  return out
}

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'] as const
type HttpMethod = typeof HTTP_METHODS[number]

function parseSpec(raw: RawSpec): ParsedSpec {
  const isV3 = typeof raw.openapi === 'string' && raw.openapi.startsWith('3')
  const isV2 = typeof raw.swagger === 'string' && raw.swagger.startsWith('2')
  if (!isV2 && !isV3) throw new Error('Formato no reconocido. Se esperaba "openapi" 3.x o "swagger" 2.x')

  const version = isV3 ? `3.x (${raw.openapi})` : '2.0 (Swagger)'

  const info = {
    title: raw.info?.title ?? 'Sin título',
    version: raw.info?.version ?? '?',
    description: raw.info?.description ?? '',
  }

  let servers: string[] = []
  if (isV3) {
    servers = (raw.servers ?? []).map(s => s.url).filter((u): u is string => Boolean(u))
  } else if (isV2) {
    const host = raw.host ?? ''
    const base = (raw.basePath ?? '').replace(/\/$/, '')
    const schemes: string[] = raw.schemes ?? ['https']
    if (host) servers = schemes.map(s => `${s}://${host}${base}`)
    else if (base) servers = [base]
  }

  const endpoints: ParsedEndpoint[] = []
  const tagsOrder: string[] = []
  const tagsSet = new Set<string>()

  for (const t of raw.tags ?? []) {
    const name = typeof t === 'string' ? t : t.name
    if (name) { tagsOrder.push(name); tagsSet.add(name) }
  }

  for (const [path, pathItem] of Object.entries(raw.paths ?? {})) {
    const pathParams: RawParameter[] = pathItem.parameters ?? []

    for (const method of HTTP_METHODS) {
      const op: RawOperation | undefined = pathItem[method as HttpMethod]
      if (!op) continue

      const tag = op.tags?.[0] ?? 'General'
      if (!tagsSet.has(tag)) { tagsSet.add(tag); tagsOrder.push(tag) }

      const opParams: RawParameter[] = op.parameters ?? []
      const allParams = [...pathParams, ...opParams]

      const parameters: ParsedParam[] = allParams.map(p => {
        const resolved: RawParameter = p.$ref ? (resolveRef<RawParameter>(p.$ref, raw) ?? p) : p
        const schema: JsonSchema | null = resolved.schema
          ? resolveSchemaRefs(resolved.schema, raw)
          : (isV2 ? { type: resolved.type, format: resolved.format, enum: resolved.enum } : null)
        return {
          name: resolved.name ?? '?',
          in: resolved.in ?? '?',
          required: resolved.required === true,
          description: resolved.description ?? '',
          schema,
        }
      })

      let requestBody: ParsedEndpoint['requestBody'] = null
      let requestBodyRequired = false

      if (isV3 && op.requestBody) {
        const rb: RawRequestBody = op.requestBody.$ref
          ? (resolveRef<RawRequestBody>(op.requestBody.$ref, raw) ?? op.requestBody)
          : op.requestBody
        requestBodyRequired = rb.required === true
        if (rb.content) {
          requestBody = {}
          for (const [mt, mediaObj] of Object.entries(rb.content)) {
            requestBody[mt] = { schema: mediaObj.schema ? resolveSchemaRefs(mediaObj.schema, raw) : null }
          }
        }
      } else if (isV2) {
        const bodyParam = allParams.find(p => p.in === 'body')
        if (bodyParam) {
          requestBodyRequired = bodyParam.required === true
          requestBody = {
            'application/json': {
              schema: bodyParam.schema ? resolveSchemaRefs(bodyParam.schema, raw) : null,
            },
          }
        }
        parameters.splice(0, parameters.length, ...parameters.filter(p => p.in !== 'body'))
      }

      const responses: ParsedResponse[] = Object.entries(op.responses ?? {}).map(([status, resp]) => {
        let schema: JsonSchema | null = null
        if (isV3 && resp.content) {
          const firstMedia = Object.values(resp.content)[0]
          schema = firstMedia?.schema ? resolveSchemaRefs(firstMedia.schema, raw) : null
        } else if (isV2 && resp.schema) {
          schema = resolveSchemaRefs(resp.schema, raw)
        }
        return { status, description: resp.description ?? '', schema }
      })

      endpoints.push({
        path,
        method: method.toUpperCase(),
        tag,
        summary: op.summary ?? '',
        description: op.description ?? '',
        operationId: op.operationId ?? '',
        parameters,
        requestBody,
        requestBodyRequired,
        responses,
      })
    }
  }

  return { version, info, servers, tags: tagsOrder, endpoints }
}

const parsedSpec = ref<ParsedSpec | null>(null)

watch(swaggerInput, (input) => {
  const trimmed = input.trim()
  if (!trimmed) { parseError.value = ''; parsedSpec.value = null; return }
  try {
    const parsed = inputLang.value === 'yaml' ? yamlLoad(trimmed) : JSON.parse(trimmed)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('El documento debe ser un objeto JSON/YAML')
    parsedSpec.value = parseSpec(parsed as RawSpec)
    parseError.value = ''
  } catch (e) {
    parseError.value = e instanceof Error ? e.message : 'Formato inválido'
    parsedSpec.value = null
  }
}, { immediate: true })

// Auto-open first tag on load
watch(parsedSpec, (spec) => {
  if (spec?.tags.length && openTags.value.size === 0) {
    openTags.value = new Set([spec.tags[0]])
  }
}, { immediate: true })

// ─── Filtering ────────────────────────────────────────────────────────────────

const filteredEndpoints = computed(() => {
  if (!parsedSpec.value) return []
  let list = parsedSpec.value.endpoints

  if (methodFilter.value.length) {
    list = list.filter(ep => methodFilter.value.includes(ep.method))
  }

  const q = search.value.trim().toLowerCase()
  if (q) {
    list = list.filter(ep =>
      ep.path.toLowerCase().includes(q) ||
      ep.method.toLowerCase().includes(q) ||
      ep.summary.toLowerCase().includes(q) ||
      ep.description.toLowerCase().includes(q) ||
      ep.tag.toLowerCase().includes(q),
    )
  }

  return list
})

const filteredTags = computed(() => {
  const withResults = new Set(filteredEndpoints.value.map(ep => ep.tag))
  return (parsedSpec.value?.tags ?? []).filter(t => withResults.has(t))
})

const endpointsByTag = computed<Record<string, ParsedEndpoint[]>>(() => {
  const map: Record<string, ParsedEndpoint[]> = {}
  for (const ep of filteredEndpoints.value) {
    ;(map[ep.tag] ??= []).push(ep)
  }
  return map
})

// ─── UI interactions ──────────────────────────────────────────────────────────

function toggleTag(tag: string) {
  const next = new Set(openTags.value)
  if (next.has(tag)) { next.delete(tag) } else { next.add(tag) }
  openTags.value = next
}

function toggleEndpoint(key: string) {
  const next = new Set(openEndpoints.value)
  if (next.has(key)) { next.delete(key) } else { next.add(key) }
  openEndpoints.value = next
}

function toggleMethodFilter(method: string) {
  const idx = methodFilter.value.indexOf(method)
  if (idx === -1) { methodFilter.value.push(method) } else { methodFilter.value.splice(idx, 1) }
}

// ─── Styling helpers ──────────────────────────────────────────────────────────

function methodBadgeClass(method: string): string {
  const map: Record<string, string> = {
    GET:     'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400',
    POST:    'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400',
    PUT:     'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400',
    PATCH:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
    DELETE:  'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400',
    HEAD:    'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400',
    OPTIONS: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
  }
  return map[method.toUpperCase()] ?? 'bg-slate-100 text-slate-600'
}

function paramInClass(loc: string): string {
  const map: Record<string, string> = {
    path:   'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    query:  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    header: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    cookie: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    body:   'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  }
  return map[loc] ?? 'bg-slate-100 text-slate-600 dark:bg-slate-600 dark:text-slate-300'
}

function responseStatusBorder(status: string): string {
  const c = parseInt(status)
  if (c >= 200 && c < 300) return 'border-emerald-200 dark:border-emerald-700'
  if (c >= 300 && c < 400) return 'border-blue-200 dark:border-blue-700'
  if (c >= 400 && c < 500) return 'border-amber-200 dark:border-amber-700'
  if (c >= 500) return 'border-red-200 dark:border-red-700'
  return 'border-slate-200 dark:border-slate-600'
}

function responseStatusBg(status: string): string {
  const c = parseInt(status)
  if (c >= 200 && c < 300) return 'bg-emerald-50 dark:bg-emerald-950/30'
  if (c >= 300 && c < 400) return 'bg-blue-50 dark:bg-blue-950/30'
  if (c >= 400 && c < 500) return 'bg-amber-50 dark:bg-amber-950/30'
  if (c >= 500) return 'bg-red-50 dark:bg-red-950/30'
  return 'bg-slate-50 dark:bg-slate-700/30'
}

function responseStatusText(status: string): string {
  const c = parseInt(status)
  if (c >= 200 && c < 300) return 'text-emerald-700 dark:text-emerald-400'
  if (c >= 300 && c < 400) return 'text-blue-700 dark:text-blue-400'
  if (c >= 400 && c < 500) return 'text-amber-700 dark:text-amber-400'
  if (c >= 500) return 'text-red-700 dark:text-red-400'
  return 'text-slate-700 dark:text-slate-300'
}

// ─── Schema rendering ─────────────────────────────────────────────────────────

function schemaTypeLabel(schema: JsonSchema | null): string {
  if (!schema) return '—'
  if (schema.$ref) return schema.$ref.split('/').pop() ?? 'any'
  if (schema.type === 'array') return `${schemaTypeLabel(schema.items ?? null)}[]`
  if (schema.enum) return schema.enum.map(e => JSON.stringify(e)).join(' | ')
  let t = schema.type ?? 'any'
  if (schema.format) t += `<${schema.format}>`
  return t
}

function renderSchema(schema: JsonSchema | null, indent = 0): string {
  if (!schema) return 'any'

  const pad = '  '.repeat(indent)
  const inner = '  '.repeat(indent + 1)

  if (schema.$ref) return schema.$ref.split('/').pop() ?? 'any'

  if (Array.isArray(schema.allOf)) {
    return schema.allOf.map(s => renderSchema(s, indent)).join('\n& ')
  }
  if (Array.isArray(schema.oneOf)) {
    return schema.oneOf.map(s => renderSchema(s, indent)).join('\n| ')
  }
  if (Array.isArray(schema.anyOf)) {
    return schema.anyOf.map(s => renderSchema(s, indent)).join('\n| ')
  }

  if (schema.type === 'object' || schema.properties) {
    const props = Object.entries(schema.properties ?? {})
    if (!props.length) return 'object'
    const required: string[] = schema.required ?? []
    const lines = ['{']
    for (const [key, val] of props) {
      const opt = required.includes(key) ? '' : '?'
      const comment = val.description ? `  // ${val.description}` : ''
      lines.push(`${inner}${key}${opt}: ${renderSchema(val, indent + 1)}${comment}`)
    }
    lines.push(`${pad}}`)
    return lines.join('\n')
  }

  if (schema.type === 'array') {
    const itemType = renderSchema(schema.items ?? null, indent)
    return itemType.includes('\n') ? `Array<${itemType}>` : `${itemType}[]`
  }

  if (schema.enum) {
    return schema.enum.map(e => JSON.stringify(e)).join(' | ')
  }

  let type = schema.type ?? 'any'
  if (schema.format) type += `<${schema.format}>`
  if (schema.nullable) type += ' | null'
  if (schema.minimum !== undefined) type += `  // min: ${schema.minimum}`
  if (schema.minLength !== undefined) type += `  // minLength: ${schema.minLength}`
  return type
}
</script>
