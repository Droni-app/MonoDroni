<template>
  <div class="flex items-start gap-3 mb-5 pb-4 border-b border-slate-200 dark:border-slate-700">
    <div :class="['w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', colorClass]">
      <i :class="`mdi ${icon} text-xl`" />
    </div>
    <div>
      <h2 class="font-bold text-lg text-zinc-900 dark:text-zinc-100">{{ title }}</h2>
      <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
        <slot />
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const COLOR_MAP: Record<string, string> = {
  indigo:  'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400',
  blue:    'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400',
  violet:  'bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400',
  amber:   'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400',
  emerald: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400',
  rose:    'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400',
  cyan:    'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-400',
}

const props = defineProps<{
  icon: string
  color: string
  title: string
}>()

const colorClass = computed(() => COLOR_MAP[props.color] ?? '')
</script>
