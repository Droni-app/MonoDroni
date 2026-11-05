<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { DuiSelect, useToast } from '@dronico/droni-kit'
import { useAuth } from '../composables/useAuth'
import { apiError } from '../services/AppiService'

const router = useRouter()
const toast = useToast()
const { sites, siteId, currentSite, loadSites, selectSite } = useAuth()

const switching = ref(false)
const options = computed(() =>
  sites.value.map((enrollment) => ({
    value: enrollment.siteId,
    label: enrollment.site?.name ?? enrollment.siteId,
  }))
)

async function handleChange(value: string | number) {
  const id = String(value)
  if (id === siteId.value || switching.value) return
  switching.value = true
  try {
    await selectSite(id)
    // What's on screen belongs to the previous site, and a detail page's id doesn't exist in this one
    await router.push('/')
  } catch (e: any) {
    toast.error(apiError(e, 'No se pudo cambiar de sitio.'))
  } finally {
    switching.value = false
  }
}

onMounted(() => {
  // Without the list the header just shows no selector; the panel keeps working on this site
  loadSites().catch(() => {})
})
</script>

<template>
  <div v-if="options.length > 1" class="w-36 sm:w-48">
    <DuiSelect
      :model-value="siteId ?? ''"
      :options="options"
      item-label="label"
      item-value="value"
      size="sm"
      block
      aria-label="Sitio"
      @update:model-value="handleChange"
    />
  </div>
  <span v-else-if="currentSite?.site" class="max-w-36 truncate text-sm font-medium sm:max-w-48">
    {{ currentSite.site.name }}
  </span>
</template>
