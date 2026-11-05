<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { DuiCard, DuiButton, DuiAlert } from '@dronico/droni-kit'
import { useAuth } from '../composables/useAuth'
import { useTheme } from '../composables/useTheme'
import logoLight from '../assets/img/logo.svg'
import logoDark from '../assets/img/logo-w.svg'

const route = useRoute()
const { login } = useAuth()
const { theme } = useTheme()
const logo = computed(() => theme.value === 'dark' ? logoDark : logoLight)

// Not started on its own: going back from appi's page lands here, and would bounce right back
const error = ref(typeof route.query.error === 'string' ? route.query.error : '')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await login()
  } catch (e: any) {
    error.value = e.message ?? 'No se pudo iniciar sesión.'
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center p-4">
    <div class="w-full max-w-sm">
      <img :src="logo" alt="Droni" class="mx-auto mb-6 h-12 w-auto" />
      <DuiCard>
        <div class="flex flex-col gap-4">
          <div>
            <h1 class="text-lg font-semibold">Panel de administración</h1>
            <p class="text-sm text-slate-500 dark:text-slate-400">Inicia sesión con tu cuenta de Droni.</p>
          </div>
          <DuiAlert v-if="error" color="danger">{{ error }}</DuiAlert>
          <DuiButton type="button" :loading="loading" block color="primary" @click="handleLogin">
            Iniciar sesión
          </DuiButton>
        </div>
      </DuiCard>
    </div>
  </div>
</template>
