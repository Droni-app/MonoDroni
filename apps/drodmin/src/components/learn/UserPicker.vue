<script setup lang="ts">
import { ref } from 'vue'
import { DuiInput, DuiButton } from '@dronico/droni-kit'
import AppiService from '../../services/AppiService'
import UserAvatar from '../ui/UserAvatar.vue'
import type { SiteUser } from '../../types/AppiService'

// Search box over the site's users. v-model is the selected user.
const user = defineModel<SiteUser | null>({ default: null })

const query = ref('')
const results = ref<SiteUser[]>([])
const searching = ref(false)

async function search() {
  if (!query.value.trim()) return
  searching.value = true
  try {
    const { data } = await AppiService.get<SiteUser[]>('/admin/learn/site-users', { params: { q: query.value.trim() } })
    results.value = data
  } finally {
    searching.value = false
  }
}

function select(selected: SiteUser) {
  user.value = selected
  results.value = []
  query.value = ''
}
</script>

<template>
  <div v-if="user" class="flex items-center gap-3 rounded-lg border border-slate-200 p-2 dark:border-slate-700">
    <UserAvatar :user="user" size="md" :show-name="false" />
    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-medium">{{ user.fullName }}</p>
      <p class="truncate text-xs text-slate-500">{{ user.email }}</p>
    </div>
    <DuiButton variant="ghost" size="sm" @click="user = null">Cambiar</DuiButton>
  </div>

  <div v-else class="flex flex-col gap-2">
    <div class="flex gap-2">
      <DuiInput v-model="query" block placeholder="Nombre o email" class="flex-1" @keydown.enter.prevent="search" />
      <DuiButton :loading="searching" title="Buscar" @click="search"><i class="mdi mdi-magnify" /></DuiButton>
    </div>
    <ul v-if="results.length" class="max-h-60 divide-y divide-slate-200 overflow-y-auto rounded-lg border border-slate-200 dark:divide-slate-700 dark:border-slate-700">
      <li v-for="result in results" :key="result.id">
        <button type="button" class="flex w-full items-center gap-3 p-2 text-left hover:bg-slate-500/10" @click="select(result)">
          <UserAvatar :user="result" :show-name="false" />
          <span class="min-w-0">
            <span class="block truncate text-sm font-medium">{{ result.fullName }}</span>
            <span class="block truncate text-xs text-slate-500">{{ result.email }}</span>
          </span>
        </button>
      </li>
    </ul>
  </div>
</template>
