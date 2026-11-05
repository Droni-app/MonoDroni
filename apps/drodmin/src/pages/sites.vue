<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { DuiCard, DuiButton, DuiAlert } from '@dronico/droni-kit'
import { useAuth, type UserSite } from '../composables/useAuth'
import { useTheme } from '../composables/useTheme'
import { apiError } from '../services/AppiService'
import logoLight from '../assets/img/logo.svg'
import logoDark from '../assets/img/logo-w.svg'

const router = useRouter()
const { loadSites, selectSite, logout } = useAuth()
const { theme } = useTheme()
const logo = computed(() => theme.value === 'dark' ? logoDark : logoLight)

const sites = ref<UserSite[]>([])
const loading = ref(true)
const selecting = ref<string | null>(null)
const error = ref('')

async function pick(id: string) {
  error.value = ''
  selecting.value = id
  try {
    await selectSite(id)
    router.replace('/')
  } catch (e: any) {
    error.value = apiError(e, 'No se pudo abrir el sitio.')
    selecting.value = null
  }
}

async function handleLogout() {
  await logout()
  router.replace('/login')
}

onMounted(async () => {
  try {
    sites.value = await loadSites()
    if (sites.value.length === 1) {
      await pick(sites.value[0].siteId)
    }
  } catch (e: any) {
    error.value = apiError(e, 'No se pudieron cargar tus sitios.')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center p-4">
    <div class="w-full max-w-sm">
      <img :src="logo" alt="Droni" class="mx-auto mb-6 h-12 w-auto" />
      <DuiCard>
        <div class="flex flex-col gap-4">
          <h1 class="text-lg font-semibold">Elige un sitio</h1>
          <DuiAlert v-if="error" color="danger">{{ error }}</DuiAlert>
          <p v-if="loading" class="flex items-center gap-2 text-slate-500">
            <i class="mdi mdi-loading mdi-spin" /> Cargando sitios...
          </p>
          <p v-else-if="!sites.length && !error" class="text-sm text-slate-500 dark:text-slate-400">
            Tu cuenta no administra ningún sitio.
          </p>
          <DuiButton
            v-for="enrollment in sites"
            :key="enrollment.siteId"
            type="button"
            block
            variant="outline"
            :loading="selecting === enrollment.siteId"
            @click="pick(enrollment.siteId)"
          >
            {{ enrollment.site?.name ?? enrollment.siteId }}
          </DuiButton>
          <DuiButton type="button" block variant="ghost" @click="handleLogout">Cerrar sesión</DuiButton>
        </div>
      </DuiCard>
    </div>
  </div>
</template>
