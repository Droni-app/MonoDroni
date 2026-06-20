<template>
  <section class="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
    <CodelabMiniSectionHeader icon="mdi-ruler" color="emerald" title="Convertidor de Unidades CSS">
      Pasa valores de px a rem, em, vw, vh y más, con base configurable.
    </CodelabMiniSectionHeader>

    <!-- Config -->
    <div class="flex flex-wrap gap-4 mb-5 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-700/40 border border-slate-200 dark:border-slate-700">
      <div class="flex items-center gap-2">
        <label class="text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">Font base</label>
        <input
          v-model.number="baseFontSize"
          type="number"
          min="1"
          class="rounded-lg px-3 py-2 bg-zinc-100 dark:bg-zinc-700/60 text-zinc-900 dark:text-zinc-100 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-20 text-sm"
        >
        <span class="text-xs text-zinc-400">px</span>
      </div>
      <div class="flex items-center gap-2">
        <label class="text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">Viewport</label>
        <input
          v-model.number="viewportW"
          type="number"
          min="1"
          class="rounded-lg px-3 py-2 bg-zinc-100 dark:bg-zinc-700/60 text-zinc-900 dark:text-zinc-100 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-20 text-sm"
        >
        <span class="text-xs text-zinc-400">×</span>
        <input
          v-model.number="viewportH"
          type="number"
          min="1"
          class="rounded-lg px-3 py-2 bg-zinc-100 dark:bg-zinc-700/60 text-zinc-900 dark:text-zinc-100 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-20 text-sm"
        >
        <span class="text-xs text-zinc-400">px</span>
      </div>
    </div>

    <!-- px input -->
    <div class="flex items-center gap-2 mb-4">
      <input
        v-model.number="pxValue"
        type="number"
        placeholder="16"
        class="rounded-lg px-3 py-2 text-sm bg-zinc-100 dark:bg-zinc-700/60 text-zinc-900 dark:text-zinc-100 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-32 text-lg font-mono"
      >
      <span class="text-zinc-500 dark:text-zinc-400 font-mono">px</span>
    </div>

    <!-- Results grid -->
    <div v-if="pxValue && !isNaN(pxValue)" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <div
        v-for="unit in units"
        :key="unit.unit"
        class="flex flex-col gap-1 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-700/50 border border-slate-200 dark:border-slate-600 group cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-600 transition-colors"
        @click="copy(unit)"
      >
        <span class="text-xs font-mono font-semibold text-zinc-400 dark:text-zinc-500 uppercase">{{ unit.unit }}</span>
        <span class="font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">{{ unit.display }}</span>
        <span class="text-xs text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
          {{ copiedUnit === unit.unit ? '¡Copiado!' : 'Clic para copiar' }}
        </span>
      </div>
    </div>
    <p v-else class="text-sm text-zinc-400 dark:text-zinc-500">Ingresa un valor en px para ver las conversiones.</p>
  </section>
</template>

<script setup lang="ts">
const pxValue    = ref<number>(16)
const baseFontSize = ref(16)
const viewportW  = ref(1920)
const viewportH  = ref(1080)
const copiedUnit = ref<string | null>(null)
let timer: ReturnType<typeof setTimeout> | null = null

const units = computed(() => {
  const px  = pxValue.value
  const b   = baseFontSize.value || 16
  const vw  = viewportW.value || 1920
  const vh  = viewportH.value || 1080
  const fmt = (n: number) => parseFloat(n.toFixed(4))
  return [
    { unit: 'rem', display: `${fmt(px / b)} rem` },
    { unit: 'em',  display: `${fmt(px / b)} em`  },
    { unit: 'vw',  display: `${fmt((px / vw) * 100)} vw` },
    { unit: 'vh',  display: `${fmt((px / vh) * 100)} vh` },
    { unit: 'pt',  display: `${fmt(px * 0.75)} pt` },
    { unit: '%',   display: `${fmt((px / b) * 100)} %` },
  ]
})

async function copy(unit: { unit: string; display: string }) {
  await navigator.clipboard.writeText(unit.display)
  copiedUnit.value = unit.unit
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => { copiedUnit.value = null }, 2000)
}

onBeforeUnmount(() => { if (timer) clearTimeout(timer) })
</script>
