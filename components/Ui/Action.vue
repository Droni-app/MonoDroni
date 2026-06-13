<template>
  <div class="relative inline-flex group">
    <!-- Glow background -->
    <div
      class="absolute
      transition-all
      duration-1000
      opacity-70 
      -inset-px
      bg-gradient-to-r
      from-[#44BCFF] via-[#FF44EC] to-[#FF675E]
      rounded-xl
      blur-lg
      group-hover:opacity-100
      group-hover:-inset-1
      group-hover:duration-200
      animate-tilt" />

    <!-- Botón principal -->
    <NuxtLink
      :to="props.to"
      :title="props.title"
      :class="[
        'relative inline-flex items-center justify-center px-8 py-2 text-lg font-bold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
        props.outline
          ? 'bg-transparent border-2 text-gray-900 dark:text-white border-gray-900 dark:border-white focus:ring-gray-500'
          : 'bg-gray-900 dark:bg-gray-100 text-gray-100 dark:text-gray-800 focus:ring-gray-900'
      ]"
      role="button">
      <slot />
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  to: string,
  title: string,
  outline?: boolean
}>()
</script>
