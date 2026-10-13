<script setup lang="ts">
withDefaults(defineProps<{ icon?: string; text?: string }>(), {
  icon: 'mdi-inbox-outline',
  text: 'No hay registros todavía.',
})
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-2 py-10 text-slate-400 dark:text-slate-500">
    <i :class="['mdi', icon, 'text-4xl']" />
    <p class="text-sm">{{ text }}</p>
    <slot />
  </div>
</template>
