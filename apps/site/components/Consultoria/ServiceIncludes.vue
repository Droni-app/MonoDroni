<template>
  <section class="bg-white dark:bg-slate-900"><div class="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24"><div class="mb-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p class="text-xs font-bold uppercase tracking-[0.28em] text-pink-600 dark:text-pink-400">Qué incluye</p><h2 class="mt-4 text-4xl font-black tracking-tight sm:text-5xl">De la idea al resultado.</h2></div><p class="max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">Construimos contigo, con objetivos claros y entregables que puedes ver, probar y medir.</p></div><div class="grid gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-3 dark:bg-slate-700"><div v-for="(item, index) in items" :key="item" class="bg-white p-7 dark:bg-slate-900"><span class="text-sm font-bold text-pink-600 dark:text-pink-400">0{{ index + 1 }}</span><h3 class="mt-12 text-xl font-black">{{ item }}</h3></div></div></div></section>
</template>

<script setup lang="ts">
defineProps<{ items: string[] }>()
</script>