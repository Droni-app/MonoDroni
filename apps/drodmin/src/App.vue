<script setup lang="ts">
import { DuiToast } from '@dronico/droni-kit'
import MainHeader from './components/MainHeader.vue'
import { useAuth } from './composables/useAuth'

const { isAuthenticated } = useAuth()
</script>

<template>
  <div class="min-h-screen bg-slate-100 text-slate-800 transition-colors duration-200 dark:bg-slate-900 dark:text-slate-100">
    <template v-if="isAuthenticated">
      <div class="relative z-50">
        <MainHeader />
      </div>
      <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <RouterView />
      </main>
    </template>
    <RouterView v-else />
    <DuiToast position="top-right" />
  </div>
</template>
