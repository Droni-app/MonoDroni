<template>
  <div class="flex flex-col h-screen bg-zinc-50 dark:bg-zinc-900">

    <!-- Toolbar -->
    <div class="flex items-center gap-3 px-4 py-2 border-b border-slate-300 dark:border-slate-700 bg-white dark:bg-zinc-800 flex-shrink-0 flex-wrap gap-y-2">
      <!-- Language selector -->
      <div class="flex items-center gap-2">
        <label class="text-xs font-medium text-zinc-500 dark:text-zinc-400">Lenguaje</label>
        <select
          v-model="selectedLang"
          class="text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          @change="resetOutput"
        >
          <option v-for="lang in LANGUAGES" :key="lang.id" :value="lang.id">
            {{ lang.label }}
          </option>
        </select>
      </div>

      <div class="w-px h-5 bg-slate-300 dark:bg-slate-600" />

      <!-- Auto-detect -->
      <DuiButton size="sm" variant="outline" :loading="detecting" @click="autoDetect">
        <i class="mdi mdi-auto-fix" /> Auto-detectar
      </DuiButton>

      <!-- Format -->
      <DuiButton size="sm" color="primary" :loading="formatting" @click="format">
        <i class="mdi mdi-auto-mode" /> Formatear
        <span class="text-xs opacity-70 ml-1 hidden sm:inline">Ctrl+Enter</span>
      </DuiButton>

      <div class="ml-auto flex items-center gap-2">
        <!-- Options -->
        <label class="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 cursor-pointer select-none">
          <input v-model="useSingleQuotes" type="checkbox" class="rounded">
          Comillas simples
        </label>
        <label class="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 cursor-pointer select-none">
          <input v-model="useSemi" type="checkbox" class="rounded">
          Punto y coma
        </label>
        <div class="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <span>Tab</span>
          <select v-model="tabWidth" class="text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 px-1 py-0.5">
            <option :value="2">2</option>
            <option :value="4">4</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Editors -->
    <div class="flex flex-1 overflow-hidden">

      <!-- Left: Input -->
      <section class="w-1/2 flex flex-col h-full border-r border-slate-300 dark:border-slate-700">
        <header class="flex items-center justify-between px-4 py-2 border-b border-slate-300 dark:border-slate-700 flex-shrink-0 bg-zinc-50 dark:bg-zinc-900">
          <h2 class="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Entrada</h2>
          <DuiButton v-if="codeInput" size="sm" variant="outline" @click="clearAll">
            <i class="mdi mdi-close" /> Limpiar
          </DuiButton>
        </header>
        <ClientOnly fallback-tag="div" fallback="Cargando editor...">
          <MonacoEditor
            v-model="codeInput"
            :lang="monacoLang"
            class="flex-1"
            :options="editorOptions"
            @keydown.ctrl.enter="format"
          />
        </ClientOnly>
      </section>

      <!-- Right: Output -->
      <section class="w-1/2 flex flex-col h-full bg-white dark:bg-zinc-800">
        <header class="flex items-center justify-between px-4 py-2 border-b border-slate-300 dark:border-slate-700 flex-shrink-0">
          <h2 class="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
            Resultado formateado
            <span v-if="formattedStats" class="ml-2 font-normal text-zinc-400 dark:text-zinc-500 text-xs">
              {{ formattedStats }}
            </span>
          </h2>
          <DuiButton v-if="codeOutput" size="sm" variant="outline" @click="copyOutput">
            <i :class="copied ? 'mdi mdi-check text-emerald-500' : 'mdi mdi-content-copy'" />
            {{ copied ? 'Copiado' : 'Copiar' }}
          </DuiButton>
        </header>

        <!-- Error -->
        <div v-if="formatError" class="m-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg flex-shrink-0">
          <p class="text-red-700 dark:text-red-300 text-sm font-mono whitespace-pre-wrap">{{ formatError }}</p>
        </div>

        <!-- Empty state -->
        <div v-else-if="!codeOutput" class="flex flex-col items-center justify-center flex-1 text-zinc-400 dark:text-zinc-500 gap-3">
          <i class="mdi mdi-code-braces text-5xl" />
          <p class="text-sm text-center px-8">
            Pega tu código en el panel izquierdo y haz clic en <strong>Formatear</strong>
          </p>
        </div>

        <!-- Output editor -->
        <ClientOnly v-else fallback-tag="div" fallback="Cargando editor...">
          <MonacoEditor
            v-model="codeOutput"
            :lang="monacoLang"
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
  title: 'Formateador de código | Droni.co',
  ogTitle: 'Formateador de código | Droni.co',
  description: 'Formatea y embellece código JSON, HTML, XML, CSS, JavaScript, TypeScript y más directamente en tu navegador.',
  ogDescription: 'Formatea y embellece código JSON, HTML, XML, CSS, JavaScript, TypeScript y más directamente en tu navegador.',
  ogImage: 'https://dronico.nyc3.digitaloceanspaces.com/4ebaccf5-b863-4f12-aa49-9bbe0e1844e2/db7d4d54-7354-4421-9682-d1b75b1f1413/74529-dronico-card.png.png',
  twitterCard: 'summary_large_image',
  ogUrl: 'https://droni.co/codelab/formatter'
})

// ─── Languages ────────────────────────────────────────────────────────────────

interface Lang {
  id: string
  label: string
  monacoId: string
  prettierParser?: string
  prettierPlugins?: string[]
}

const LANGUAGES: Lang[] = [
  { id: 'json',       label: 'JSON',        monacoId: 'json' },
  { id: 'xml',        label: 'XML',         monacoId: 'xml' },
  { id: 'html',       label: 'HTML',        monacoId: 'html',       prettierParser: 'html',       prettierPlugins: ['html'] },
  { id: 'css',        label: 'CSS',         monacoId: 'css',        prettierParser: 'css',        prettierPlugins: ['postcss'] },
  { id: 'scss',       label: 'SCSS',        monacoId: 'scss',       prettierParser: 'scss',       prettierPlugins: ['postcss'] },
  { id: 'less',       label: 'Less',        monacoId: 'less',       prettierParser: 'less',       prettierPlugins: ['postcss'] },
  { id: 'javascript', label: 'JavaScript',  monacoId: 'javascript', prettierParser: 'babel',      prettierPlugins: ['babel', 'estree'] },
  { id: 'typescript', label: 'TypeScript',  monacoId: 'typescript', prettierParser: 'typescript', prettierPlugins: ['typescript', 'estree'] },
  { id: 'graphql',    label: 'GraphQL',     monacoId: 'graphql',    prettierParser: 'graphql',    prettierPlugins: ['graphql'] },
  { id: 'yaml',       label: 'YAML',        monacoId: 'yaml',       prettierParser: 'yaml',       prettierPlugins: ['yaml'] },
  { id: 'markdown',   label: 'Markdown',    monacoId: 'markdown',   prettierParser: 'markdown',   prettierPlugins: ['markdown'] },
]

// ─── State ────────────────────────────────────────────────────────────────────

const selectedLang = ref('json')
const codeInput = ref('')
const codeOutput = ref('')
const formatError = ref('')
const formatting = ref(false)
const detecting = ref(false)
const copied = ref(false)
const useSingleQuotes = ref(true)
const useSemi = ref(false)
const tabWidth = ref<2 | 4>(2)

const currentLang = computed(() => LANGUAGES.find(l => l.id === selectedLang.value)!)
const monacoLang = computed(() => currentLang.value.monacoId)

const editorOptions = computed(() => ({
  theme: 'vs-dark',
  fontSize: 13,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  wordWrap: 'on' as const,
  tabSize: tabWidth.value,
}))

const formattedStats = computed(() => {
  if (!codeOutput.value || !codeInput.value) return ''
  const outLines = codeOutput.value.split('\n').length
  return `${outLines} líneas`
})

// ─── Plugin loader (static imports for Vite) ─────────────────────────────────

const PLUGIN_LOADERS: Record<string, () => Promise<unknown>> = {
  babel:      () => import('prettier/plugins/babel'),
  estree:     () => import('prettier/plugins/estree'),
  html:       () => import('prettier/plugins/html'),
  postcss:    () => import('prettier/plugins/postcss'),
  typescript: () => import('prettier/plugins/typescript'),
  graphql:    () => import('prettier/plugins/graphql'),
  yaml:       () => import('prettier/plugins/yaml'),
  markdown:   () => import('prettier/plugins/markdown'),
}

// ─── Formatters ───────────────────────────────────────────────────────────────

function formatJson(code: string): string {
  return JSON.stringify(JSON.parse(code), null, tabWidth.value)
}

function formatXml(code: string): string {
  const INDENT = ' '.repeat(tabWidth.value)

  // Remove existing whitespace between tags, preserve text nodes
  const normalized = code
    .replace(/\r\n/g, '\n')
    .replace(/>\s+</g, '><')
    .replace(/></g, '>\n<')

  let level = 0
  const lines: string[] = []

  for (const raw of normalized.split('\n')) {
    const line = raw.trim()
    if (!line) continue

    const isClosing = /^<\//.test(line)
    const isSelfClosing = /\/>$/.test(line) || /^<\?/.test(line) || /^<!--/.test(line) || /^<!\[/.test(line) || /^<!/.test(line)
    // Opening tag that has matching inline close: <tag>text</tag>
    const isInlineClose = /^<[^/][^>]*>[^<]+<\/[^>]+>$/.test(line)

    if (isClosing) level = Math.max(0, level - 1)

    lines.push(INDENT.repeat(level) + line)

    if (!isClosing && !isSelfClosing && !isInlineClose && /^<[^?!/]/.test(line)) {
      level++
    }
  }

  return lines.join('\n')
}

async function formatWithPrettier(code: string, parser: string, pluginNames: string[]): Promise<string> {
  const [prettierModule, ...pluginModules] = await Promise.all([
    import('prettier/standalone'),
    ...pluginNames.map(name => PLUGIN_LOADERS[name]()),
  ])

  const prettier = prettierModule as typeof import('prettier/standalone')

  return prettier.format(code, {
    parser,
    plugins: pluginModules,
    semi: useSemi.value,
    singleQuote: useSingleQuotes.value,
    tabWidth: tabWidth.value,
    printWidth: 100,
    trailingComma: 'es5',
  })
}

// ─── Actions ──────────────────────────────────────────────────────────────────

async function format() {
  if (!codeInput.value.trim()) return

  formatting.value = true
  formatError.value = ''
  codeOutput.value = ''

  try {
    const lang = currentLang.value

    if (lang.id === 'json') {
      codeOutput.value = formatJson(codeInput.value)
    } else if (lang.id === 'xml') {
      codeOutput.value = formatXml(codeInput.value)
    } else if (lang.prettierParser && lang.prettierPlugins) {
      codeOutput.value = await formatWithPrettier(
        codeInput.value,
        lang.prettierParser,
        lang.prettierPlugins,
      )
    }
  } catch (err) {
    formatError.value = err instanceof Error ? err.message : 'Error al formatear el código.'
  } finally {
    formatting.value = false
  }
}

function autoDetect() {
  detecting.value = true
  const code = codeInput.value.trim()

  if (!code) {
    detecting.value = false
    return
  }

  let detected = 'javascript'

  if (/^[\[{]/.test(code)) {
    try {
      JSON.parse(code)
      detected = 'json'
    } catch {
      detected = 'javascript'
    }
  } else if (/^<\?xml/i.test(code)) {
    detected = 'xml'
  } else if (/^<!DOCTYPE html/i.test(code) || /^<html/i.test(code) || (/<\/?(div|span|p|a|img|ul|li|head|body|script|link)\b/i.test(code) && !/<\?xml/i.test(code))) {
    detected = 'html'
  } else if (/^<[a-zA-Z]/.test(code) && /<\/[a-zA-Z]/.test(code)) {
    detected = 'xml'
  } else if (/\{[\s\S]*:[\s\S]*;/.test(code) && !/(function|const|let|var|=>|import|export)/.test(code)) {
    if (/\$[a-zA-Z]/.test(code) || /&[a-zA-Z]/.test(code)) {
      detected = 'scss'
    } else {
      detected = 'css'
    }
  } else if (/^---\n/.test(code) || /^- /.test(code) || /^[a-zA-Z_]+:\s+/.test(code.split('\n')[0])) {
    detected = 'yaml'
  } else if (/type |interface |: string|: number|: boolean|<[A-Z]/.test(code)) {
    detected = 'typescript'
  } else if (/^#+ /.test(code) && /(\*\*|__)/.test(code)) {
    detected = 'markdown'
  } else if (/query |mutation |fragment |subscription /.test(code)) {
    detected = 'graphql'
  } else if (/(const|let|var|function|=>|import|export|require)/.test(code)) {
    detected = 'javascript'
  }

  selectedLang.value = detected
  detecting.value = false
}

function resetOutput() {
  codeOutput.value = ''
  formatError.value = ''
}

function clearAll() {
  codeInput.value = ''
  codeOutput.value = ''
  formatError.value = ''
}

async function copyOutput() {
  await navigator.clipboard.writeText(codeOutput.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

// Keyboard shortcut: Ctrl+Enter
onMounted(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault()
      format()
    }
  }
  window.addEventListener('keydown', handler)
  onBeforeUnmount(() => window.removeEventListener('keydown', handler))
})
</script>
