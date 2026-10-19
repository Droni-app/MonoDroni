<template>
  <div class="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-900 text-zinc-100">
    <div class="flex items-center justify-between px-3 py-1.5 bg-zinc-800 text-xs text-zinc-400">
      <span>{{ label }}</span>
      <button
        class="flex items-center gap-1 hover:text-zinc-100 transition-colors cursor-pointer"
        title="Copiar"
        @click="copy"
      >
        <i :class="`mdi ${copied ? 'mdi-check text-emerald-400' : 'mdi-content-copy'}`" />
        {{ copied ? 'Copiado' : 'Copiar' }}
      </button>
    </div>
    <pre class="p-3 text-xs leading-5 overflow-x-auto"><code>{{ code }}</code></pre>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  code: string
  label?: string
}>(), {
  label: 'json',
})

const copied = ref(false)

async function copy() {
  await navigator.clipboard.writeText(props.code)
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}
</script>
