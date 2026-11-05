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
      <div v-if="tab === 'login'">
        <p class="text-slate-600 dark:text-slate-300 text-sm mb-4">
          Te llevaremos a la pagina de acceso de Droni, donde puedes entrar con tu email o con Google.
        </p>
        <DuiButton type="button" color="primary" :loading="loading" :block="true" @click="submitLogin">
          Continuar
        </DuiButton>
        <details class="mt-4 text-sm text-slate-600 dark:text-slate-300">
          <summary class="cursor-pointer">¿No te llego el correo de activacion?</summary>
          <form class="mt-3" @submit.prevent="resendActivationEmail">
            <DuiLabel title="Email" class="mb-3">
              <DuiInput v-model="resendEmail" type="email" :block="true" />
            </DuiLabel>
            <DuiButton type="submit" color="secondary" :loading="resendLoading" :block="true">
              Reenviar correo de activacion
            </DuiButton>
          </form>
        </details>
      </div>

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
const { status, login, register } = useSiteAuth()

const tab = ref<'login' | 'register'>('login')
const loading = ref(false)
const resendLoading = ref(false)
const error = ref(route.query.error ? 'No se pudo iniciar sesion. Intentalo de nuevo.' : '')
const success = ref('')
const resendEmail = ref('')

const redirectTo = computed(() => (typeof route.query.redirect === 'string' ? route.query.redirect : '/'))

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

watchEffect(() => {
  if (status.value === 'authenticated') {
    router.replace(redirectTo.value)
  }
})

async function submitLogin() {
  error.value = ''
  success.value = ''
  loading.value = true
  await login(redirectTo.value)
}

async function submitRegister() {
  error.value = ''
  success.value = ''
  loading.value = true
  try {
    await register(registerForm.value)
    success.value = 'Registro completado. Revisa tu correo para activar la cuenta y luego inicia sesion.'
    tab.value = 'login'
    resendEmail.value = registerForm.value.email
  } catch (e: any) {
    error.value = extractApiErrorMessage(e, 'No se pudo registrar la cuenta.')
  } finally {
    loading.value = false
  }
}

async function resendActivationEmail() {
  error.value = ''
  success.value = ''

  if (!resendEmail.value) {
    error.value = 'Escribe tu email para reenviar el correo de activacion.'
    return
  }

  resendLoading.value = true
  try {
    const data = await $fetch<{ message?: string }>('/api/session/resend-verification', {
      method: 'POST',
      body: {
        email: resendEmail.value,
      },
    })
    success.value = data?.message ?? 'Correo de activacion reenviado. Revisa tu bandeja de entrada.'
  } catch (e: any) {
    error.value = extractApiErrorMessage(e, 'No se pudo reenviar el correo de activacion.')
  } finally {
    resendLoading.value = false
  }
}
</script>
