<template>
  <section class="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
    <CodelabMiniSectionHeader icon="mdi-format-letter-case" color="violet" title="Case Converter">
      Transforma un texto a distintos formatos de capitalización al instante.
    </CodelabMiniSectionHeader>

    <textarea
      v-model="input"
      rows="2"
      placeholder="Escribe o pega tu texto aquí..."
      class="w-full resize-none rounded-lg p-3 font-mono text-sm bg-zinc-100 dark:bg-zinc-700/60 text-zinc-900 dark:text-zinc-100 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-zinc-400 dark:placeholder-zinc-500"
    />

    <div v-if="input" class="mt-4 flex flex-col gap-1">
      <div
        v-for="variant in variants"
        :key="variant.id"
        class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700/50 group"
      >
        <span class="w-36 flex-shrink-0 text-xs font-mono font-semibold text-zinc-500 dark:text-zinc-400">{{ variant.label }}</span>
        <span class="flex-1 font-mono text-sm text-zinc-900 dark:text-zinc-100 break-all">{{ variant.value }}</span>
        <CodelabMiniCopyButton :text="variant.value" :active="copiedId === variant.id" @copy="flash(variant.id)" />
      </div>
    </div>
    <p v-else class="mt-3 text-sm text-zinc-400 dark:text-zinc-500">Escribe algo para ver las variantes.</p>
  </section>
</template>

<script setup lang="ts">
const input    = ref('')
const copiedId = ref<string | null>(null)
let timer: ReturnType<typeof setTimeout> | null = null

function words(str: string): string[] {
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_\-\s/]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
}

const variants = computed(() => {
  const str = input.value
  if (!str) return []
  const w     = words(str)
  const lower = w.map(s => s.toLowerCase())
  const cap   = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
  return [
    { id: 'camel',    label: 'camelCase',     value: lower.map((s, i) => i === 0 ? s : cap(s)).join('') },
    { id: 'pascal',   label: 'PascalCase',    value: lower.map(cap).join('') },
    { id: 'snake',    label: 'snake_case',    value: lower.join('_') },
    { id: 'kebab',    label: 'kebab-case',    value: lower.join('-') },
    { id: 'constant', label: 'CONSTANT_CASE', value: lower.join('_').toUpperCase() },
    { id: 'upper',    label: 'UPPERCASE',     value: str.toUpperCase() },
    { id: 'lower',    label: 'lowercase',     value: str.toLowerCase() },
    { id: 'title',    label: 'Title Case',    value: lower.map(cap).join(' ') },
    { id: 'dot',      label: 'dot.case',      value: lower.join('.') },
    { id: 'path',     label: 'path/case',     value: lower.join('/') },
  ]
})

function flash(id: string) {
  copiedId.value = id
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => { copiedId.value = null }, 2000)
}

onBeforeUnmount(() => { if (timer) clearTimeout(timer) })
</script>
