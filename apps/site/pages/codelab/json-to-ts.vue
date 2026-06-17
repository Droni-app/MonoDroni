<template>
  <div v-if="true" class="flex h-screen bg-zinc-50 dark:bg-zinc-900">
    <!-- Left section -->
    <section class="w-1/2 flex flex-col h-full border-r border-slate-300 dark:border-slate-700">
      <header class="flex items-center justify-between p-4 border-b border-slate-300 dark:border-slate-700">
        <h2 class="font-bold text-lg">JSON Input</h2>
      </header>
      <ClientOnly fallback-tag="div" fallback="Cargando editor...">
        <MonacoEditor 
          v-model="jsonInput" 
          lang="json" 
          class="flex-1"
          :options="{ theme: 'vs-dark', formatOnPaste: true, formatOnType: true }" 
        />
      </ClientOnly>
    </section>

    <!-- Right section -->
    <section class="w-1/2 flex flex-col h-full bg-white dark:bg-zinc-800">
      <header class="flex items-center justify-between p-4 border-b border-slate-300 dark:border-slate-700">
        <h2 class="font-bold text-lg">TypeScript Output</h2>
        <DuiButton 
          size="sm" 
          variant="outline"
          @click="copyToClipboard"
        >
          <i class="mdi mdi-content-copy" />
          Copiar
        </DuiButton>
      </header>
      <ClientOnly fallback-tag="div" fallback="Cargando editor...">
        <MonacoEditor 
          v-model="tsOutput" 
          lang="typescript" 
          class="flex-1"
          :options="{ theme: 'vs-dark', readOnly: true }" 
        />
      </ClientOnly>
      <footer v-if="conversionError" class="p-4 bg-red-50 dark:bg-red-900 border-t border-red-200 dark:border-red-800">
        <p class="text-red-800 dark:text-red-200 text-sm">
          <i class="mdi mdi-alert-circle" />
          {{ conversionError }}
        </p>
      </footer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { DuiButton } from '@dronico/droni-kit'

useSeoMeta({
  title: 'JSON a TypeScript | Droni.co',
  ogTitle: 'JSON a TypeScript | Droni.co',
  description: 'Convierte estructuras JSON a interfaces TypeScript automáticamente.',
  ogDescription: 'Convierte estructuras JSON a interfaces TypeScript automáticamente.',
  ogImage: 'https://dronico.nyc3.digitaloceanspaces.com/4ebaccf5-b863-4f12-aa49-9bbe0e1844e2/db7d4d54-7354-4421-9682-d1b75b1f1413/74529-dronico-card.png.png',
  twitterCard: 'summary_large_image',
  ogUrl: 'https://droni.co/codelab/json-to-ts'
})

const jsonInput = ref(`{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "isActive": true,
  "tags": ["developer", "typescript"],
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zipCode": "10001"
  }
}`)

const tsOutput = ref('')
const conversionError = ref('')

function jsonToTypeScript(obj: unknown, rootName = 'Root'): string {
  const interfaces: string[] = []
  const seen = new Set<string>()

  const isValidIdentifier = (key: string) => /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)

  const toTypeName = (name: string) => {
    const cleaned = name
      .replace(/[^A-Za-z0-9_$]+/g, ' ')
      .trim()
      .split(/\s+/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('')
    return cleaned || 'Type'
  }

  const inferArrayType = (arr: unknown[], ctxName: string): string => {
    if (arr.length === 0) return 'any[]'

    const itemTypes = new Set<string>()
    for (const item of arr) {
      itemTypes.add(inferType(item, `${ctxName}Item`))
    }

    if (itemTypes.size === 1) {
      return `${Array.from(itemTypes)[0]}[]`
    }

    return `${Array.from(itemTypes).join(' | ')}[]`
  }

  const inferType = (value: unknown, ctxName: string): string => {
    if (value === null) return 'null'
    if (Array.isArray(value)) return inferArrayType(value, ctxName)
    if (typeof value === 'string') return 'string'
    if (typeof value === 'number') return 'number'
    if (typeof value === 'boolean') return 'boolean'
    if (typeof value === 'object') {
      const typeName = toTypeName(ctxName)
      buildInterface(typeName, value as Record<string, unknown>)
      return typeName
    }
    return 'unknown'
  }

  const buildInterface = (name: string, data: Record<string, unknown>) => {
    if (seen.has(name)) return
    seen.add(name)

    const lines: string[] = [`export interface ${name} {`]
    for (const [key, value] of Object.entries(data)) {
      const prop = isValidIdentifier(key) ? key : `'${key}'`
      lines.push(`  ${prop}: ${inferType(value, key)};`)
    }
    lines.push('}')
    interfaces.push(lines.join('\n'))
  }

  if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
    buildInterface(toTypeName(rootName), obj as Record<string, unknown>)
    return interfaces.reverse().join('\n\n')
  }

  return `export type ${toTypeName(rootName)} = ${inferType(obj, rootName)};`
}

const generateTypeScript = (json: string) => {
  try {
    conversionError.value = ''

    if (!json.trim()) {
      tsOutput.value = ''
      return
    }

    const parsed = JSON.parse(json)
    tsOutput.value = jsonToTypeScript(parsed)
  } catch (error) {
    conversionError.value = error instanceof Error ? error.message : 'Error al convertir JSON'
    tsOutput.value = ''
  }
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(tsOutput.value)
    // Mostrar feedback visual (opcional)
    const button = document.querySelector('[data-copy-button]')
    if (button) {
      const originalText = button.innerHTML
      button.innerHTML = '<i class="mdi mdi-check"></i> Copiado'
      setTimeout(() => {
        button.innerHTML = originalText
      }, 2000)
    }
  } catch {
    conversionError.value = 'Error al copiar al portapapeles'
  }
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(() => jsonInput.value, (newValue) => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  debounceTimer = setTimeout(() => {
    generateTypeScript(newValue)
  }, 500)
})

onBeforeUnmount(() => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
})

// Generar TypeScript inicial
onMounted(() => {
  generateTypeScript(jsonInput.value)
})
</script>
