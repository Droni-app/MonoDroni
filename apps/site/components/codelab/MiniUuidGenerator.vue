<template>
  <section class="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
    <CodelabMiniSectionHeader icon="mdi-identifier" color="cyan" title="Generador de UUIDs">
      Genera UUIDs v4 aleatorios usando <code class="font-mono text-xs">crypto.randomUUID()</code> directamente en el navegador.
    </CodelabMiniSectionHeader>

    <!-- Controls -->
    <div class="flex flex-wrap items-center gap-3 mb-4">
      <div class="flex items-center gap-2">
        <span class="text-sm text-zinc-600 dark:text-zinc-400">Cantidad</span>
        <div class="flex rounded-lg border border-slate-300 dark:border-slate-600 overflow-hidden text-sm">
          <button
            v-for="n in COUNTS"
            :key="n"
            class="px-2.5 py-1.5 font-mono font-medium transition-colors"
            :class="count === n ? 'bg-cyan-600 text-white' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'"
            @click="count = n"
          >
            {{ n }}
          </button>
        </div>
      </div>

      <label class="flex items-center gap-2 cursor-pointer select-none text-sm text-zinc-600 dark:text-zinc-400">
        <input v-model="uppercase" type="checkbox" class="rounded accent-cyan-500">
        Mayúsculas
      </label>

      <div class="flex gap-2 ml-auto">
        <DuiButton v-if="uuids.length" size="sm" variant="outline" @click="copyAll">
          <i :class="`mdi ${copiedAll ? 'mdi-check text-emerald-500' : 'mdi-content-copy'}`" />
          {{ copiedAll ? 'Copiados' : 'Copiar todos' }}
        </DuiButton>
        <DuiButton v-if="uuids.length" size="sm" variant="outline" @click="uuids = []">
          <i class="mdi mdi-delete-outline" /> Limpiar
        </DuiButton>
        <DuiButton size="sm" color="primary" @click="generate">
          <i class="mdi mdi-refresh" /> Generar
        </DuiButton>
      </div>
    </div>

    <!-- UUID list -->
    <div v-if="uuids.length" class="flex flex-col divide-y divide-slate-200 dark:divide-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div
        v-for="(uuid, i) in uuids"
        :key="i"
        class="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 group"
      >
        <span class="text-xs text-zinc-400 dark:text-zinc-500 w-5 text-right flex-shrink-0">{{ i + 1 }}</span>
        <span class="flex-1 font-mono text-sm text-zinc-900 dark:text-zinc-100 select-all">{{ uuid }}</span>
        <CodelabMiniCopyButton :text="uuid" :active="copiedIndex === i" @copy="flash(i)" />
      </div>
    </div>

    <div v-else class="flex items-center justify-center h-20 text-zinc-400 dark:text-zinc-500 text-sm rounded-lg border border-dashed border-slate-300 dark:border-slate-600">
      Haz clic en <strong class="mx-1">Generar</strong> para crear UUIDs.
    </div>
  </section>
</template>

<script setup lang="ts">
import { DuiButton } from '@dronico/droni-kit'

const COUNTS = [1, 5, 10, 25, 50] as const

const count       = ref(5)
const uppercase   = ref(false)
const uuids       = ref<string[]>([])
const copiedIndex = ref<number | null>(null)
const copiedAll   = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

function generate() {
  const newUuids = Array.from({ length: count.value }, () => {
    const id = crypto.randomUUID()
    return uppercase.value ? id.toUpperCase() : id
  })
  uuids.value = [...newUuids, ...uuids.value].slice(0, 200)
}

function flash(i: number) {
  copiedIndex.value = i
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => { copiedIndex.value = null }, 2000)
}

async function copyAll() {
  await navigator.clipboard.writeText(uuids.value.join('\n'))
  copiedAll.value = true
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => { copiedAll.value = false }, 2000)
}

onBeforeUnmount(() => { if (timer) clearTimeout(timer) })
</script>
