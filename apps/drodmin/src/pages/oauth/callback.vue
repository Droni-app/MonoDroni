<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { apiError } from '../../services/AppiService'

const route = useRoute()
const router = useRouter()
const { handleOauthCallback } = useAuth()

onMounted(async () => {
  try {
    const loggedIn = await handleOauthCallback(route.query)
    router.replace(loggedIn ? '/sites' : '/login')
  } catch (e: any) {
    const error = apiError(e, e.message ?? 'No se pudo iniciar sesión.')
    router.replace({ path: '/login', query: { error } })
  }
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center p-4">
    <p class="flex items-center justify-center gap-2 py-4 text-slate-500">
      <i class="mdi mdi-loading mdi-spin" /> Iniciando sesión...
    </p>
  </div>
</template>
