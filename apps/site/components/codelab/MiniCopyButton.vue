<template>
  <button
    title="Copiar"
    :class="[
      'flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg transition-colors',
      active
        ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30'
        : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700',
    ]"
    @click="handleCopy"
  >
    <i :class="`mdi ${active ? 'mdi-check' : 'mdi-content-copy'} text-sm`" />
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  text: string
  active?: boolean
}>()

const emit = defineEmits<{ copy: [] }>()

async function handleCopy() {
  await navigator.clipboard.writeText(props.text)
  emit('copy')
}
</script>
