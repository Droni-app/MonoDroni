<template>
  <section class="border-b border-slate-900/10 dark:border-white/10">
    <div class="mx-auto grid max-w-7xl gap-12 px-6 pb-16 pt-12 lg:grid-cols-[.9fr_1.1fr] lg:items-end lg:px-10 lg:pb-24 lg:pt-20">
      <div>
        <NuxtLink to="/consultoria" class="mb-10 inline-flex items-center gap-2 text-sm font-bold text-pink-600 transition hover:gap-3 dark:text-pink-400"><i class="mdi mdi-arrow-left" /> Todos los servicios</NuxtLink>
        <p class="mb-5 text-xs font-bold uppercase tracking-[0.28em] text-pink-600 dark:text-pink-400">Consultoría digital</p>
        <h1 class="text-5xl font-black leading-[.95] tracking-tight sm:text-7xl">{{ title }}</h1>
      </div>
      <div class="relative h-72 sm:h-[28rem]"><div class="absolute bottom-0 left-0 h-4/5 w-4/5 bg-pink-500 dark:bg-pink-600" /><img :src="image" :alt="description" class="absolute right-0 top-0 h-[90%] w-[90%] object-cover grayscale-[15%]"></div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{ title: string; image: string; description: string }>()
</script>