<template>
  <section class="mx-auto grid max-w-7xl gap-14 px-6 py-16 lg:grid-cols-[.75fr_1.25fr] lg:px-10 lg:py-24">
    <div><p class="text-xs font-bold uppercase tracking-[0.28em] text-pink-600 dark:text-pink-400">La oportunidad</p><p class="mt-6 text-2xl font-bold leading-tight sm:text-3xl">{{ lead }}</p></div>
    <div><p class="max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">{{ description }}</p><div class="mt-12 grid gap-8 border-t border-slate-900/10 pt-8 sm:grid-cols-2 dark:border-white/10"><div v-for="benefit in benefits" :key="benefit.title"><i :class="benefit.icon" class="text-2xl text-pink-600 dark:text-pink-400" /><h2 class="mt-4 text-lg font-black">{{ benefit.title }}</h2><p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{{ benefit.text }}</p></div></div></div>
  </section>
</template>

<script setup lang="ts">
defineProps<{ lead: string; description: string; benefits: Array<{ title: string; text: string; icon: string }> }>()
</script>