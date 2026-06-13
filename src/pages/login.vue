<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { DuiCard, DuiInput, DuiLabel, DuiButton, DuiAlert } from '@dronico/droni-kit'
import { useAuth } from '../composables/useAuth'
import AppiService from '../services/AppiService'

const router = useRouter()
const { login, loginWithGoogle } = useAuth()

type Step = 'site' | 'credentials'

const step = ref<Step>('site')
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
    if (e.response?.status === 404) {
      error.value = 'El sitio no fue encontrado. Verifica el Site ID.'
    } else {
      error.value = e.response?.data?.message ?? e.message ?? 'No se pudo verificar el sitio.'
    }
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
    error.value = e.response?.data?.message ?? e.message ?? 'Error al iniciar sesión'
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
    error.value = e.response?.data?.message ?? e.message ?? 'Error al iniciar sesión con Google'
    googleLoading.value = false
  }
}

function goBack() {
  step.value = 'site'
  error.value = ''
}
</script>

<template>
  <div class="login-wrapper">
    <DuiCard>
      <form v-if="step === 'site'" @submit.prevent="handleSiteSubmit">
        <DuiAlert v-if="error" color="danger">{{ error }}</DuiAlert>
        <DuiLabel title="Site ID">
          <DuiInput v-model="siteId" :block="true" placeholder="Ingresa tu Site ID" autofocus />
        </DuiLabel>
        <DuiButton type="submit" :loading="loading" :block="true" color="primary">
          Continuar
        </DuiButton>
      </form>

      <form v-else @submit.prevent="handleSubmit">
        <DuiAlert v-if="error" color="danger">{{ error }}</DuiAlert>
        <div class="site-badge">
          <span>{{ siteId }}</span>
          <button type="button" class="site-badge-change" @click="goBack">Cambiar</button>
        </div>
        <DuiLabel title="Email">
          <DuiInput v-model="email" type="email" :block="true" autofocus />
        </DuiLabel>
        <DuiLabel title="Contraseña">
          <DuiInput v-model="password" type="password" :block="true" />
        </DuiLabel>
        <DuiButton type="submit" :loading="loading" :block="true" color="primary">
          Iniciar sesión
        </DuiButton>
        <DuiButton type="button" :loading="googleLoading" :block="true" color="neutral" @click="handleGoogleLogin">
          <i class="mdi mdi-google" /> Iniciar sesión con Google
        </DuiButton>
      </form>
    </DuiCard>
  </div>
</template>

<style scoped>
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.site-badge {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--dui-color-neutral-100, #f3f4f6);
  border-radius: 6px;
  padding: 6px 12px;
  margin-bottom: 12px;
  font-size: 0.875rem;
  font-weight: 500;
}

.site-badge-change {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.75rem;
  color: var(--dui-color-primary, #6366f1);
  padding: 0;
  text-decoration: underline;
}
</style>
