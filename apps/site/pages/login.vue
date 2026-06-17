<template>
  <section class="container mx-auto px-4 py-10 max-w-xl">
    <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg p-6">
      <header class="mb-6">
        <h1 class="text-2xl font-semibold text-slate-900 dark:text-slate-100">Accede a tu cuenta</h1>
        <p class="text-slate-600 dark:text-slate-300 text-sm">
          Inicia sesion o crea una cuenta para poder comentar.
        </p>
      </header>

      <div class="flex gap-2 mb-4">
        <button
          class="px-4 py-2 rounded-lg text-sm font-medium"
          :class="tab === 'login' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'"
          @click="tab = 'login'"
        >
          Iniciar sesion
        </button>
        <button
          class="px-4 py-2 rounded-lg text-sm font-medium"
          :class="tab === 'register' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'"
          @click="tab = 'register'"
        >
          Registrarme
        </button>
      </div>

      <DuiAlert v-if="error" color="danger" class="mb-3">{{ error }}</DuiAlert>
      <DuiAlert v-if="success" color="success" class="mb-3">{{ success }}</DuiAlert>
      <DuiButton
        v-if="showResendActivation"
        type="button"
        color="secondary"
        :loading="resendLoading"
        :block="true"
        class="mb-3"
        @click="resendActivationEmail"
      >
        Reenviar correo de activacion
      </DuiButton>

      <form v-if="tab === 'login'" @submit.prevent="submitLogin">
        <DuiLabel title="Email" class="mb-3">
          <DuiInput v-model="loginForm.email" type="email" :block="true" autofocus />
        </DuiLabel>
        <DuiLabel title="Contrasena" class="mb-3">
          <DuiInput v-model="loginForm.password" type="password" :block="true" />
        </DuiLabel>
        <DuiButton type="submit" color="primary" :loading="loading" :block="true">
          Entrar
        </DuiButton>
        <DuiButton
          type="button"
          color="neutral"
          :loading="googleLoading"
          :block="true"
          class="mt-2"
          @click="submitGoogleLogin"
        >
          <i class="mdi mdi-google" />
          Iniciar sesion con Google
        </DuiButton>
      </form>

      <form v-else @submit.prevent="submitRegister">
        <DuiLabel title="Nombre completo" class="mb-3">
          <DuiInput v-model="registerForm.fullName" :block="true" autofocus />
        </DuiLabel>
        <DuiLabel title="Email" class="mb-3">
          <DuiInput v-model="registerForm.email" type="email" :block="true" />
        </DuiLabel>
        <DuiLabel title="Contrasena" class="mb-3">
          <DuiInput v-model="registerForm.password" type="password" :block="true" />
        </DuiLabel>
        <DuiLabel title="Confirmar contrasena" class="mb-3">
          <DuiInput v-model="registerForm.passwordConfirmation" type="password" :block="true" />
        </DuiLabel>
        <DuiButton type="submit" color="primary" :loading="loading" :block="true">
          Crear cuenta
        </DuiButton>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { DuiAlert, DuiButton, DuiInput, DuiLabel } from '@dronico/droni-kit'

const route = useRoute()
const router = useRouter()
const { status, login, loginWithGoogle, register } = useSiteAuth()

const tab = ref<'login' | 'register'>('login')
const loading = ref(false)
const resendLoading = ref(false)
const googleLoading = ref(false)
const error = ref('')
const success = ref('')

const loginForm = ref({
  email: '',
  password: '',
})

const registerForm = ref({
  fullName: '',
  email: '',
  password: '',
  passwordConfirmation: '',
})

function extractApiErrorMessage(e: any, fallback: string) {
  const firstError = e?.data?.errors?.[0]?.message
  return firstError ?? e?.data?.message ?? e?.statusMessage ?? e?.message ?? fallback
}

const showResendActivation = computed(() =>
  tab.value === 'login' && error.value.toLowerCase().includes('email not verified')
)

watchEffect(() => {
  if (status.value === 'authenticated') {
    const redirectTo = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    router.replace(redirectTo)
  }
})

async function submitLogin() {
  error.value = ''
  success.value = ''
  loading.value = true
  try {
    await login(loginForm.value.email, loginForm.value.password)
    const redirectTo = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await router.push(redirectTo)
  } catch (e: any) {
    error.value = extractApiErrorMessage(e, 'No se pudo iniciar sesion.')
  } finally {
    loading.value = false
  }
}

async function submitRegister() {
  error.value = ''
  success.value = ''
  loading.value = true
  try {
    await register(registerForm.value)
    success.value = 'Registro completado. Ahora inicia sesion con tu cuenta.'
    tab.value = 'login'
    loginForm.value.email = registerForm.value.email
  } catch (e: any) {
    error.value = extractApiErrorMessage(e, 'No se pudo registrar la cuenta.')
  } finally {
    loading.value = false
  }
}

async function resendActivationEmail() {
  error.value = ''
  success.value = ''

  if (!loginForm.value.email) {
    error.value = 'Escribe tu email para reenviar el correo de activacion.'
    return
  }

  resendLoading.value = true
  try {
    const data = await $fetch<{ message?: string }>('/api/session/resend-verification', {
      method: 'POST',
      body: {
        email: loginForm.value.email,
      },
    })
    success.value = data?.message ?? 'Correo de activacion reenviado. Revisa tu bandeja de entrada.'
  } catch (e: any) {
    error.value = extractApiErrorMessage(e, 'No se pudo reenviar el correo de activacion.')
  } finally {
    resendLoading.value = false
  }
}

async function submitGoogleLogin() {
  error.value = ''
  success.value = ''
  googleLoading.value = true
  try {
    await loginWithGoogle()
  } catch (e: any) {
    error.value = extractApiErrorMessage(e, 'No se pudo iniciar sesion con Google.')
    googleLoading.value = false
  }
}
</script>
