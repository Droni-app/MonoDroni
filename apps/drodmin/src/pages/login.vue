<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { DuiCard, DuiForm, DuiInput, DuiLabel, DuiButton, DuiAlert } from '@dronico/droni-kit'
import { useAuth } from '../composables/useAuth'
import { useTheme } from '../composables/useTheme'
import AppiService, { apiError } from '../services/AppiService'
import logoLight from '../assets/img/logo.svg'
import logoDark from '../assets/img/logo-w.svg'

const router = useRouter()
const { login, loginWithGoogle } = useAuth()
const { theme } = useTheme()
const logo = computed(() => theme.value === 'dark' ? logoDark : logoLight)

const step = ref<'site' | 'credentials'>('site')
const siteId = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const googleLoading = ref(false)

async function handleSiteSubmit() {
  error.value = ''
  loading.value = true
  try {
    await AppiService.get('/', { headers: { 'x-site-id': siteId.value } })
    step.value = 'credentials'
  } catch (e: any) {
    error.value = e.response?.status === 404
      ? 'El sitio no fue encontrado. Verifica el Site ID.'
      : apiError(e, 'No se pudo verificar el sitio.')
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    await login(email.value, password.value, siteId.value)
    router.push('/')
  } catch (e: any) {
    error.value = apiError(e, e.message ?? 'Error al iniciar sesión')
  } finally {
    loading.value = false
  }
}

async function handleGoogleLogin() {
  error.value = ''
  googleLoading.value = true
  try {
    await loginWithGoogle(siteId.value)
  } catch (e: any) {
    error.value = apiError(e, e.message ?? 'Error al iniciar sesión con Google')
    googleLoading.value = false
  }
}

function goBack() {
  step.value = 'site'
  error.value = ''
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center p-4">
    <div class="w-full max-w-sm">
      <img :src="logo" alt="Droni" class="mx-auto mb-6 h-12 w-auto" />
      <DuiCard>
        <DuiForm v-if="step === 'site'" @submit="handleSiteSubmit">
          <template #header>
            <h1 class="text-lg font-semibold">Panel de administración</h1>
            <p class="text-sm text-slate-500 dark:text-slate-400">Ingresa el ID del sitio que quieres administrar.</p>
          </template>
          <DuiAlert v-if="error" color="danger">{{ error }}</DuiAlert>
          <DuiLabel title="Site ID" required>
            <DuiInput v-model="siteId" block placeholder="Ingresa tu Site ID" required autofocus />
          </DuiLabel>
          <DuiButton type="submit" :loading="loading" block color="primary">Continuar</DuiButton>
        </DuiForm>

        <DuiForm v-else @submit="handleSubmit">
          <template #header>
            <div class="flex items-center justify-between gap-2">
              <div class="min-w-0">
                <p class="text-xs text-slate-500 dark:text-slate-400">Sitio</p>
                <p class="truncate font-mono text-sm">{{ siteId }}</p>
              </div>
              <DuiButton variant="ghost" size="sm" @click="goBack">Cambiar</DuiButton>
            </div>
          </template>
          <DuiAlert v-if="error" color="danger">{{ error }}</DuiAlert>
          <DuiLabel title="Email" required>
            <DuiInput v-model="email" type="email" block required autofocus />
          </DuiLabel>
          <DuiLabel title="Contraseña" required>
            <DuiInput v-model="password" type="password" block required />
          </DuiLabel>
          <DuiButton type="submit" :loading="loading" block color="primary">Iniciar sesión</DuiButton>
          <DuiButton type="button" :loading="googleLoading" block variant="outline" @click="handleGoogleLogin">
            <i class="mdi mdi-google mr-1" /> Continuar con Google
          </DuiButton>
        </DuiForm>
      </DuiCard>
    </div>
  </div>
</template>
