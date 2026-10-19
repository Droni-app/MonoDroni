<template>
  <article :id="endpoint.id" class="scroll-mt-24 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5 shadow-sm">
    <header class="flex flex-wrap items-center gap-2 mb-2">
      <span :class="['px-2 py-0.5 rounded-md text-xs font-black tracking-wider', methodClass]">{{ endpoint.method }}</span>
      <code class="text-sm font-semibold break-all">{{ endpoint.path }}</code>
      <span
        :class="['ml-auto px-2 py-0.5 rounded-full text-xs font-semibold', accessClass]"
        :title="access.description"
      >
        <i class="mdi mdi-lock-outline" /> {{ access.label }}
      </span>
    </header>
    <h4 class="text-lg font-bold">{{ endpoint.summary }}</h4>
    <p v-if="endpoint.description" class="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{{ endpoint.description }}</p>

    <div class="mt-4 space-y-4">
      <AppiFields v-if="endpoint.pathParams?.length" title="Parámetros de ruta" :fields="endpoint.pathParams" />
      <AppiFields v-if="endpoint.query?.length" title="Query string" :fields="endpoint.query" />
      <AppiFields
        v-if="endpoint.body?.length"
        :title="endpoint.multipart ? 'Cuerpo (multipart/form-data)' : 'Cuerpo (JSON)'"
        :fields="endpoint.body"
      />

      <div v-if="endpoint.request || endpoint.response" class="grid gap-4 lg:grid-cols-2">
        <AppiCode v-if="endpoint.request" :code="endpoint.request" :label="endpoint.multipart ? 'Ejemplo (curl)' : 'Ejemplo de petición'" />
        <AppiCode v-if="endpoint.response" :code="endpoint.response" label="Ejemplo de respuesta" />
      </div>

      <ul v-if="endpoint.notes?.length" class="space-y-1">
        <li
          v-for="note in endpoint.notes"
          :key="note"
          class="flex gap-2 text-sm text-zinc-600 dark:text-zinc-300"
        >
          <i class="mdi mdi-information-outline text-sky-500" />
          <span>{{ note }}</span>
        </li>
      </ul>
    </div>
  </article>
</template>

<script setup lang="ts">
import { accessLabels, type ApiEndpoint } from '~/data/appiDocs'

const props = defineProps<{ endpoint: ApiEndpoint }>()

const methodClasses: Record<ApiEndpoint['method'], string> = {
  GET: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  POST: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  PUT: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  DELETE: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
}

const toneClasses: Record<string, string> = {
  emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  sky: 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  rose: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  violet: 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
}

const methodClass = computed(() => methodClasses[props.endpoint.method])
const access = computed(() => accessLabels[props.endpoint.access])
const accessClass = computed(() => toneClasses[access.value.tone])
</script>
