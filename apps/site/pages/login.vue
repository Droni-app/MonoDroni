<template>
  <section class="container mx-auto px-4 py-10 max-w-xl">
    <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg p-6">
      <template v-if="failed">
        <DuiAlert color="danger" class="mb-3">No se pudo iniciar sesion. Intentalo de nuevo.</DuiAlert>
        <DuiButton type="button" color="primary" :block="true" @click="login(redirectTo)">
          Reintentar
        </DuiButton>
      </template>
      <p v-else class="text-slate-600 dark:text-slate-300 text-sm">Redirigiendo...</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { DuiAlert, DuiButton } from '@dronico/droni-kit'

const route = useRoute()
const { status, login } = useSiteAuth()

const redirectTo = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
const failed = computed(() => !!route.query.error)

// With an error the flow must not restart on its own, or a failing callback would loop
if (status.value === 'authenticated') {
  await navigateTo(redirectTo, { replace: true })
} else if (!failed.value) {
  await login(redirectTo)
}
</script>
