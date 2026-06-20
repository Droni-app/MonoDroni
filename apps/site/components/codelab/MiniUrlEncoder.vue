<template>
  <section class="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
    <CodelabMiniSectionHeader icon="mdi-link-variant" color="indigo" title="URL Encoder / Decoder">
      Codifica y decodifica caracteres especiales de una URL (ideal para parámetros de consulta).
    </CodelabMiniSectionHeader>

    <div class="flex flex-col gap-3">
      <textarea
        v-model="input"
        rows="3"
        placeholder="Pega tu texto o URL aquí..."
        class="w-full resize-none rounded-lg p-3 font-mono text-sm bg-zinc-100 dark:bg-zinc-700/60 text-zinc-900 dark:text-zinc-100 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-zinc-400 dark:placeholder-zinc-500"
      />

      <div class="flex gap-2 flex-wrap">
        <DuiButton size="sm" color="primary" @click="run('encode')">
          <i class="mdi mdi-arrow-right-circle" /> Codificar
        </DuiButton>
        <DuiButton size="sm" color="primary" @click="run('decode')">
          <i class="mdi mdi-arrow-left-circle" /> Decodificar
        </DuiButton>
        <DuiButton v-if="input || output !== null" size="sm" variant="outline" @click="clear">
          <i class="mdi mdi-close" /> Limpiar
        </DuiButton>
      </div>

      <p v-if="error" class="text-red-500 dark:text-red-400 text-sm">{{ error }}</p>

      <div v-if="output !== null" class="relative">
        <textarea
          :value="output"
          rows="3"
          readonly
          class="w-full resize-none rounded-lg p-3 font-mono text-sm bg-zinc-100 dark:bg-zinc-700/60 text-zinc-900 dark:text-zinc-100 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-zinc-400 dark:placeholder-zinc-500 pr-10"
        />
        <CodelabMiniCopyButton
          :text="output"
          :active="copied"
          class="absolute top-2 right-2"
          @copy="flashCopy"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { DuiButton } from '@dronico/droni-kit'

const input  = ref('')
const output = ref<string | null>(null)
const error  = ref('')
const copied = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

function run(mode: 'encode' | 'decode') {
  error.value = ''
  try {
    output.value = mode === 'encode'
      ? encodeURIComponent(input.value)
      : decodeURIComponent(input.value)
  } catch {
    error.value = mode === 'encode' ? 'Error al codificar.' : 'El texto no es una URL codificada válida.'
    output.value = null
  }
}

function clear() {
  input.value  = ''
  output.value = null
  error.value  = ''
}

function flashCopy() {
  copied.value = true
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => { copied.value = false }, 2000)
}

onBeforeUnmount(() => { if (timer) clearTimeout(timer) })
</script>
