<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { DuiCard, DuiAlert, DuiButton } from '@dronico/droni-kit'
import { useAuth } from '../../../composables/useAuth'
import { apiError } from '../../../services/AppiService'

const route = useRoute()
const router = useRouter()
const { handleGoogleCallback } = useAuth()

const error = ref('')

onMounted(async () => {
  const code = route.query.code as string
  if (!code) {
    error.value = 'Código de autorización no encontrado.'
    return
  }
  try {
    await handleGoogleCallback(code)
    router.push('/')
  } catch (e: any) {
    error.value = apiError(e, e.message ?? 'Error al autenticar con Google.')
  }
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center p-4">
    <DuiCard class="w-full max-w-sm">
      <template v-if="error">
        <DuiAlert color="danger">{{ error }}</DuiAlert>
        <DuiButton to="/login" block class="mt-4">Volver al login</DuiButton>
      </template>
      <p v-else class="flex items-center justify-center gap-2 py-4 text-slate-500">
        <i class="mdi mdi-loading mdi-spin" /> Autenticando con Google...
      </p>
    </DuiCard>
  </div>
</template>
