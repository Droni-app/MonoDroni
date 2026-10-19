<template>
  <nav class="space-y-1 text-sm">
    <NuxtLink
      to="/proyectos/appi"
      class="flex items-center gap-2 px-3 py-2 rounded-lg transition"
      :class="linkClass(!current)"
    >
      <i class="mdi mdi-rocket-launch-outline" /> Primeros pasos
    </NuxtLink>
    <div v-for="mod in appiModules" :key="mod.slug">
      <NuxtLink
        :to="`/proyectos/appi/${mod.slug}`"
        class="flex items-center gap-2 px-3 py-2 rounded-lg transition"
        :class="linkClass(current === mod.slug)"
      >
        <i :class="mod.icon" /> {{ mod.name }}
      </NuxtLink>
      <ul v-if="current === mod.slug" class="ml-5 mt-1 mb-2 border-l border-zinc-200 dark:border-zinc-700">
        <li v-for="group in mod.groups" :key="group.id">
          <a
            :href="`#${group.id}`"
            class="block pl-3 py-1 text-zinc-500 hover:text-pink-600 dark:text-zinc-400 dark:hover:text-pink-400"
          >
            {{ group.title }}
          </a>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { appiModules } from '~/data/appiDocs'

defineProps<{ current?: string }>()

function linkClass(active: boolean) {
  return active
    ? 'bg-pink-50 text-pink-700 font-semibold dark:bg-pink-900/30 dark:text-pink-300'
    : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700/50'
}
</script>
