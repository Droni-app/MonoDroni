<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { DuiCard, DuiAlert } from '@dronico/droni-kit'
import { useAuth } from '../../../composables/useAuth'

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
    error.value = e.response?.data?.message ?? e.message ?? 'Error al autenticar con Google.'
  }
})
</script>

<template>
  <div class="callback-wrapper">
    <DuiCard>
      <DuiAlert v-if="error" color="danger">{{ error }}</DuiAlert>
      <p v-else>Autenticando con Google...</p>
    </DuiCard>
  </div>
</template>

<style scoped>
.callback-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
</style>
