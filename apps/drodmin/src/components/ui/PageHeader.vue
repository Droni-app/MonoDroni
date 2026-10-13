<script setup lang="ts">
import { DuiButton } from '@dronico/droni-kit'

defineProps<{
  title: string
  subtitle?: string
  back?: string
}>()
</script>

<template>
  <header class="mb-6 flex flex-wrap items-center justify-between gap-4">
    <div class="flex min-w-0 items-center gap-3">
      <DuiButton v-if="back" :to="back" variant="ghost" size="sm" title="Volver">
        <i class="mdi mdi-arrow-left text-lg" />
      </DuiButton>
      <div class="min-w-0">
        <h1 class="truncate text-2xl font-bold text-slate-800 dark:text-slate-100">{{ title }}</h1>
        <p v-if="subtitle" class="truncate text-sm text-slate-500 dark:text-slate-400">{{ subtitle }}</p>
      </div>
    </div>
    <div v-if="$slots.default" class="flex flex-wrap items-center gap-2">
      <slot />
    </div>
  </header>
</template>
