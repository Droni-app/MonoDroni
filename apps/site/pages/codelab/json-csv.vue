<template>
  <div class="flex flex-col h-screen bg-zinc-50 dark:bg-zinc-900">

    <!-- Toolbar -->
    <div class="flex items-center gap-3 px-4 py-2 border-b border-slate-300 dark:border-slate-700 bg-white dark:bg-zinc-800 flex-shrink-0 flex-wrap gap-y-2">
      <!-- Direction -->
      <div class="flex rounded-lg border border-slate-300 dark:border-slate-600 overflow-hidden text-sm">
        <button
          class="px-3 py-1.5 font-medium transition-colors flex items-center gap-1.5"
          :class="direction === 'json-to-csv' ? 'bg-indigo-600 text-white' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'"
          @click="setDirection('json-to-csv')"
        >
          JSON <i class="mdi mdi-arrow-right text-xs" /> CSV
        </button>
        <button
          class="px-3 py-1.5 font-medium transition-colors flex items-center gap-1.5"
          :class="direction === 'csv-to-json' ? 'bg-indigo-600 text-white' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'"
          @click="setDirection('csv-to-json')"
        >
          CSV <i class="mdi mdi-arrow-right text-xs" /> JSON
        </button>
      </div>

      <div class="w-px h-5 bg-slate-300 dark:bg-slate-600" />

      <!-- Delimiter -->
      <div class="flex items-center gap-2">
        <span class="text-xs font-medium text-zinc-500 dark:text-zinc-400">Separador</span>
        <div class="flex rounded-lg border border-slate-300 dark:border-slate-600 overflow-hidden text-sm">
          <button
            v-for="d in DELIMITERS"
            :key="d.value"
            class="px-2.5 py-1.5 font-mono font-medium transition-colors"
            :class="delimiter === d.value ? 'bg-emerald-600 text-white' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'"
            :title="d.label"
            @click="delimiter = d.value"
          >
            {{ d.symbol }}
          </button>
        </div>
      </div>

      <div class="w-px h-5 bg-slate-300 dark:bg-slate-600" />

      <!-- Convert -->
      <DuiButton size="sm" color="primary" :loading="converting" @click="convert">
        <i class="mdi mdi-swap-horizontal" /> Convertir
        <span class="text-xs opacity-70 ml-1 hidden sm:inline">Ctrl+Enter</span>
      </DuiButton>

      <div class="ml-auto flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500">
        <i class="mdi mdi-shield-check text-emerald-500" /> Todo en el cliente
      </div>
    </div>

    <!-- Body -->
    <div class="flex flex-1 overflow-hidden">

      <!-- Left: Input -->
      <section class="w-1/2 flex flex-col h-full border-r border-slate-300 dark:border-slate-700">
        <header class="flex items-center justify-between px-4 py-2 border-b border-slate-300 dark:border-slate-700 flex-shrink-0 bg-zinc-50 dark:bg-zinc-900">
          <h2 class="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
            {{ direction === 'json-to-csv' ? 'JSON de entrada' : 'CSV de entrada' }}
          </h2>
          <div class="flex gap-2">
            <DuiButton size="sm" variant="outline" @click="triggerFileInput">
              <i class="mdi mdi-upload" /> Cargar archivo
            </DuiButton>
            <DuiButton v-if="input" size="sm" variant="outline" @click="clearAll">
              <i class="mdi mdi-close" />
            </DuiButton>
          </div>
        </header>
        <input ref="fileInputRef" type="file" class="hidden" :accept="inputAccept" @change="onFileLoad" />
        <ClientOnly fallback-tag="div" fallback="Cargando editor...">
          <MonacoEditor
            v-model="input"
            :lang="inputMonacoLang"
            class="flex-1"
            :options="editorOptions"
          />
        </ClientOnly>
      </section>

      <!-- Right: Output -->
      <section class="w-1/2 flex flex-col h-full bg-white dark:bg-zinc-800">
        <header class="flex items-center justify-between px-4 py-2 border-b border-slate-300 dark:border-slate-700 flex-shrink-0">
          <h2 class="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
            {{ direction === 'json-to-csv' ? 'CSV resultante' : 'JSON resultante' }}
            <span v-if="outputStats" class="ml-2 font-normal text-zinc-400 text-xs">{{ outputStats }}</span>
          </h2>
          <div class="flex gap-2">
            <DuiButton v-if="output" size="sm" variant="outline" @click="downloadOutput">
              <i class="mdi mdi-download" /> Descargar
            </DuiButton>
            <DuiButton v-if="output" size="sm" variant="outline" @click="copyOutput">
              <i :class="copied ? 'mdi mdi-check text-emerald-500' : 'mdi mdi-content-copy'" />
              {{ copied ? 'Copiado' : 'Copiar' }}
            </DuiButton>
          </div>
        </header>

        <!-- Error -->
        <div v-if="conversionError" class="m-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg flex-shrink-0">
          <p class="text-red-700 dark:text-red-300 text-sm font-mono whitespace-pre-wrap">{{ conversionError }}</p>
        </div>

        <!-- Empty state -->
        <div v-else-if="!output" class="flex flex-col items-center justify-center flex-1 text-zinc-400 dark:text-zinc-500 gap-3">
          <i class="mdi mdi-table-arrow-right text-5xl" />
          <p class="text-sm text-center px-8">
            {{ direction === 'json-to-csv'
              ? 'Pega un JSON en el panel izquierdo y haz clic en Convertir'
              : 'Pega un CSV en el panel izquierdo y haz clic en Convertir'
            }}
          </p>
        </div>

        <!-- Output editor -->
        <ClientOnly v-else fallback-tag="div" fallback="Cargando editor...">
          <MonacoEditor
            v-model="output"
            :lang="outputMonacoLang"
            class="flex-1"
            :options="{ ...editorOptions, readOnly: true }"
          />
        </ClientOnly>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DuiButton } from '@dronico/droni-kit'

useSeoMeta({
  title: 'JSON ↔ CSV | Droni.co',
  ogTitle: 'JSON ↔ CSV | Droni.co',
  description: 'Convierte entre JSON y CSV de forma instantánea en tu navegador. Carga archivos y descarga el resultado.',
  ogDescription: 'Convierte entre JSON y CSV de forma instantánea en tu navegador. Carga archivos y descarga el resultado.',
  ogImage: 'https://dronico.nyc3.digitaloceanspaces.com/4ebaccf5-b863-4f12-aa49-9bbe0e1844e2/db7d4d54-7354-4421-9682-d1b75b1f1413/74529-dronico-card.png.png',
  twitterCard: 'summary_large_image',
  ogUrl: 'https://droni.co/codelab/json-csv'
})

// ─── Constants ────────────────────────────────────────────────────────────────

type Direction = 'json-to-csv' | 'csv-to-json'

const DELIMITERS = [
  { value: ',',  symbol: ',',  label: 'Coma'        },
  { value: ';',  symbol: ';',  label: 'Punto y coma' },
  { value: '\t', symbol: '⇥', label: 'Tab'          },
  { value: '|',  symbol: '|',  label: 'Pipe'         },
]

// ─── State ────────────────────────────────────────────────────────────────────

const direction  = ref<Direction>('json-to-csv')
const delimiter  = ref(',')
const input      = ref('')
const output     = ref('')
const converting = ref(false)
const copied     = ref(false)
const conversionError = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)

// ─── Computed ─────────────────────────────────────────────────────────────────

const inputMonacoLang  = computed(() => direction.value === 'json-to-csv' ? 'json' : 'plaintext')
const outputMonacoLang = computed(() => direction.value === 'json-to-csv' ? 'plaintext' : 'json')
const inputAccept = computed(() => direction.value === 'json-to-csv' ? '.json,application/json' : '.csv,text/csv,text/plain')

const outputStats = computed(() => {
  if (!output.value) return ''
  if (direction.value === 'json-to-csv') {
    const rows = output.value.split('\n').filter(Boolean)
    return `${rows.length - 1} filas · ${rows[0]?.split(delimiter.value).length ?? 0} columnas`
  } else {
    try {
      const arr = JSON.parse(output.value)
      return `${arr.length} registros · ${Object.keys(arr[0] ?? {}).length} campos`
    } catch {
      return ''
    }
  }
})

const editorOptions = computed(() => ({
  theme: 'vs-dark',
  fontSize: 13,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  wordWrap: 'off' as const,
}))

// ─── CSV parsing ─────────────────────────────────────────────────────────────

function parseCsvRow(line: string, sep: string): string[] {
  const result: string[] = []
  let cell = ''
  let inQuotes = false
  let i = 0

  while (i < line.length) {
    const ch = line[i]

    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cell += '"'
        i += 2
      } else if (ch === '"') {
        inQuotes = false
        i++
      } else {
        cell += ch
        i++
      }
    } else {
      if (ch === '"') {
        inQuotes = true
        i++
      } else if (line.startsWith(sep, i)) {
        result.push(cell)
        cell = ''
        i += sep.length
      } else {
        cell += ch
        i++
      }
    }
  }

  result.push(cell)
  return result
}

function escapeCsvCell(value: unknown, sep: string): string {
  if (value === null || value === undefined) return ''
  const str = typeof value === 'object' ? JSON.stringify(value) : String(value)
  const needsQuote = str.includes(sep) || str.includes('"') || str.includes('\n') || str.includes('\r')
  return needsQuote ? `"${str.replace(/"/g, '""')}"` : str
}

// ─── Converters ───────────────────────────────────────────────────────────────

// Recursively flatten a single object into a flat key→string map.
// Nested objects: path/subkey. Arrays of objects: path/0/subkey, path/1/subkey.
function flattenObject(
  value: unknown,
  prefix: string,
  out: Record<string, string> = {},
): Record<string, string> {
  if (value === null || value === undefined) {
    out[prefix] = ''
  } else if (Array.isArray(value)) {
    if (value.length === 0) {
      out[prefix] = ''
    } else {
      value.forEach((item, i) => {
        flattenObject(item, prefix ? `${prefix}/${i}` : String(i), out)
      })
    }
  } else if (typeof value === 'object') {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      flattenObject(v, prefix ? `${prefix}/${k}` : k, out)
    }
  } else {
    out[prefix] = String(value)
  }
  return out
}

// Extract rows from any JSON shape, using "/" as path separator in column names.
// Supports:
//   - root array: each element → row
//   - root object with array fields: each array element → row (columns prefixed with field name)
//   - root object with no arrays: single row
function extractRows(parsed: unknown): Array<Record<string, string>> {
  // Root is an array
  if (Array.isArray(parsed)) {
    if (parsed.length === 0) throw new Error('El array JSON está vacío.')
    return parsed.map(item => flattenObject(item, ''))
  }

  // Root is a plain object
  if (typeof parsed === 'object' && parsed !== null) {
    const obj = parsed as Record<string, unknown>
    const entries = Object.entries(obj)

    const arrayEntries  = entries.filter(([, v]) => Array.isArray(v)) as [string, unknown[]][]
    const scalarEntries = entries.filter(([, v]) => !Array.isArray(v))

    if (arrayEntries.length === 0) {
      return [flattenObject(parsed, '')]
    }

    // Flatten root-level scalars/objects that are not arrays
    const rootFlat: Record<string, string> = {}
    for (const [k, v] of scalarEntries) flattenObject(v, k, rootFlat)

    const rows: Array<Record<string, string>> = []
    for (const [arrayKey, array] of arrayEntries) {
      if (array.length === 0) continue
      for (const item of array) {
        const rowFlat = flattenObject(item, arrayKey)
        rows.push({ ...rootFlat, ...rowFlat })
      }
    }

    if (rows.length === 0) throw new Error('No se encontraron datos para convertir.')
    return rows
  }

  return [{ value: String(parsed) }]
}

function jsonToCsv(jsonText: string, sep: string): string {
  const parsed = JSON.parse(jsonText)
  const rows = extractRows(parsed)

  // Collect all unique keys preserving order of first occurrence
  const keySet = new Set<string>()
  for (const row of rows) {
    for (const k of Object.keys(row)) keySet.add(k)
  }
  const keys = [...keySet]

  const header   = keys.map(k => escapeCsvCell(k, sep)).join(sep)
  const rowLines = rows.map(row => keys.map(k => escapeCsvCell(row[k] ?? '', sep)).join(sep))

  return [header, ...rowLines].join('\n')
}

function csvToJson(csvText: string, sep: string): string {
  // Normalize line endings, remove trailing empty lines
  const lines = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  const nonEmpty = lines.filter(l => l.trim())

  if (nonEmpty.length < 2) {
    throw new Error('El CSV debe tener al menos una fila de encabezados y una de datos.')
  }

  const headers = parseCsvRow(nonEmpty[0], sep)

  if (headers.length === 0 || headers.every(h => !h.trim())) {
    throw new Error('No se encontraron encabezados válidos en la primera fila.')
  }

  const records = nonEmpty.slice(1).map((line, i) => {
    const cells = parseCsvRow(line, sep)
    const record: Record<string, string | number | boolean | null> = {}
    for (let j = 0; j < headers.length; j++) {
      const key = headers[j].trim()
      const raw = cells[j] ?? ''
      record[key] = coerceValue(raw)
    }
    return record
  })

  return JSON.stringify(records, null, 2)
}

// Coerce strings to native types when unambiguous
function coerceValue(raw: string): string | number | boolean | null {
  const trimmed = raw.trim()
  if (trimmed === '') return null
  if (trimmed === 'true') return true
  if (trimmed === 'false') return false
  if (trimmed === 'null' || trimmed === 'NULL') return null
  const num = Number(trimmed)
  if (!Number.isNaN(num) && trimmed !== '') return num
  return raw
}

// ─── Actions ──────────────────────────────────────────────────────────────────

async function convert() {
  if (!input.value.trim()) return

  converting.value = true
  conversionError.value = ''
  output.value = ''

  await nextTick()

  try {
    if (direction.value === 'json-to-csv') {
      output.value = jsonToCsv(input.value, delimiter.value)
    } else {
      output.value = csvToJson(input.value, delimiter.value)
    }
  } catch (err) {
    conversionError.value = err instanceof Error ? err.message : 'Error desconocido al convertir.'
  } finally {
    converting.value = false
  }
}

function setDirection(d: Direction) {
  direction.value = d
  clearAll()
}

function clearAll() {
  input.value = ''
  output.value = ''
  conversionError.value = ''
  if (fileInputRef.value) fileInputRef.value.value = ''
}

// ─── File I/O ─────────────────────────────────────────────────────────────────

function triggerFileInput() {
  fileInputRef.value?.click()
}

function onFileLoad(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (ev) => {
    input.value = ev.target?.result as string
    output.value = ''
    conversionError.value = ''
  }
  reader.onerror = () => {
    conversionError.value = 'Error al leer el archivo.'
  }
  reader.readAsText(file, 'UTF-8')
}

function downloadOutput() {
  if (!output.value) return

  const isJson = direction.value === 'csv-to-json'
  const mime = isJson ? 'application/json' : 'text/csv'
  const ext  = isJson ? 'json' : 'csv'
  const filename = `conversion.${ext}`

  const blob = new Blob([output.value], { type: `${mime};charset=utf-8;` })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

async function copyOutput() {
  await navigator.clipboard.writeText(output.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

// ─── Keyboard shortcut ────────────────────────────────────────────────────────

onMounted(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault()
      convert()
    }
  }
  window.addEventListener('keydown', handler)
  onBeforeUnmount(() => window.removeEventListener('keydown', handler))
})
</script>
