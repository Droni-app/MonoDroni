<template>
  <section class="container mx-auto px-4 py-10 max-w-xl">
    <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg p-6">
      <h1 class="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Autenticando con Google</h1>
      <p class="text-slate-600 dark:text-slate-300 text-sm mb-4">
        Estamos validando tu acceso. Esto puede tardar unos segundos.
      </p>

      <DuiAlert v-if="error" color="danger" class="mb-3">{{ error }}</DuiAlert>
      <DuiButton v-if="error" color="primary" :block="true" @click="goToLogin">
        Volver a login
      </DuiButton>
      <DuiButton v-else color="primary" :loading="true" :block="true">
        Procesando...
      </DuiButton>
    </div>
  </section>
</template>

<script setup lang="ts">
import { DuiAlert, DuiButton } from '@dronico/droni-kit'

const route = useRoute()
const router = useRouter()
const { handleGoogleCallback } = useSiteAuth()
const error = ref('')

onMounted(async () => {
  const code = typeof route.query.code === 'string' ? route.query.code : null

  if (!code) {
    error.value = 'No se recibio el codigo de autorizacion de Google.'
    return
  }

  try {
    await handleGoogleCallback(code)
    const redirectTo = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await router.replace(redirectTo)
  } catch (e: any) {
    const firstError = e?.data?.errors?.[0]?.message
    error.value = firstError ?? e?.data?.message ?? e?.statusMessage ?? e?.message ?? 'No se pudo completar el login con Google.'
  }
})

function goToLogin() {
  router.push('/login')
}
</script>
