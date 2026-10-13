<script setup lang="ts">
import { DuiCard } from '@dronico/droni-kit'
import { useAuth } from '../composables/useAuth'
import { modules } from '../navigation'
import PageHeader from '../components/ui/PageHeader.vue'

const { user, siteId } = useAuth()
</script>

<template>
  <PageHeader :title="`Hola, ${user?.fullName ?? 'admin'}`" :subtitle="`Sitio: ${siteId}`" />

  <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
    <DuiCard v-for="mod in modules" :key="mod.label">
      <h2 class="mb-3 flex items-center gap-2 text-lg font-semibold">
        <i :class="['mdi', mod.icon, 'text-blue-500']" />
        {{ mod.label }}
      </h2>
      <nav class="flex flex-col">
        <RouterLink
          v-for="item in mod.children"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-500/10 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
        >
          <i :class="['mdi', item.icon]" />
          {{ item.label }}
          <i class="mdi mdi-chevron-right ml-auto opacity-50" />
        </RouterLink>
      </nav>
    </DuiCard>
  </div>
</template>
