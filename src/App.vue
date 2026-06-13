<script setup lang="ts">
import MainHeader from './components/MainHeader.vue'
import { useAuth } from './composables/useAuth'

const { isAuthenticated } = useAuth()
</script>

<template>
  <div class="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors duration-200">
    <div v-if="isAuthenticated" class="relative z-50">
      <MainHeader />
    </div>
    <RouterView />
  </div>
</template>
