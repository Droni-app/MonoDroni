<template>
  <section class="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
    <CodelabMiniSectionHeader icon="mdi-magnify" color="blue" title="Analizador de Query String">
      Separa una URL en sus parámetros clave–valor para leerlos fácilmente.
    </CodelabMiniSectionHeader>

    <input
      v-model="url"
      type="text"
      placeholder="https://ejemplo.com/search?q=hola+mundo&lang=es&page=2"
      class="rounded-lg px-3 py-2 text-sm bg-zinc-100 dark:bg-zinc-700/60 text-zinc-900 dark:text-zinc-100 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full"
    >

    <div v-if="base" class="mt-3 flex items-center gap-2 text-sm flex-wrap">
      <span class="text-zinc-500 dark:text-zinc-400">URL base:</span>
      <code class="font-mono bg-zinc-100 dark:bg-zinc-700 px-2 py-0.5 rounded text-zinc-800 dark:text-zinc-200 break-all">{{ base }}</code>
    </div>

    <div v-if="params.length" class="mt-3 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 dark:bg-slate-800/60">
          <tr>
            <th class="text-left px-4 py-2 font-semibold text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 w-1/3">Parámetro</th>
            <th class="text-left px-4 py-2 font-semibold text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Valor</th>
            <th class="w-10" />
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
          <tr v-for="(p, i) in params" :key="i">
            <td class="px-4 py-2 font-mono text-indigo-600 dark:text-indigo-400 break-all">{{ p.key }}</td>
            <td class="px-4 py-2 text-zinc-700 dark:text-zinc-300 break-all">{{ p.value }}</td>
            <td class="px-2 py-2">
              <CodelabMiniCopyButton :text="p.value" :active="copiedIndex === i" @copy="flash(i)" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else-if="url && !params.length" class="mt-3 text-sm text-zinc-400 dark:text-zinc-500">
      No se encontraron parámetros en esta URL.
    </p>
  </section>
</template>

<script setup lang="ts">
const url = ref('')
const copiedIndex = ref<number | null>(null)
let timer: ReturnType<typeof setTimeout> | null = null

const base = computed(() => {
  const raw = url.value.trim()
  if (!raw) return ''
  try {
    const u = new URL(raw)
    return u.origin + u.pathname
  } catch {
    return ''
  }
})

const params = computed<{ key: string; value: string }[]>(() => {
  const raw = url.value.trim()
  if (!raw) return []
  try {
    let search: string
    try {
      search = new URL(raw).search
    } catch {
      search = raw.startsWith('?') ? raw : `?${raw}`
    }
    return [...new URLSearchParams(search).entries()].map(([key, value]) => ({ key, value }))
  } catch {
    return []
  }
})

function flash(i: number) {
  copiedIndex.value = i
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => { copiedIndex.value = null }, 2000)
}

onBeforeUnmount(() => { if (timer) clearTimeout(timer) })
</script>
