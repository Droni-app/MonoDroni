<script setup lang="ts">
import { DuiCard } from '@dronico/droni-kit'
import { useAuth } from '../composables/useAuth'
import PageHeader from '../components/ui/PageHeader.vue'
import UserAvatar from '../components/ui/UserAvatar.vue'

const { user, siteId } = useAuth()
</script>

<template>
  <div class="mx-auto max-w-lg">
    <PageHeader title="Mi perfil" />
    <DuiCard>
      <div class="flex flex-col items-center gap-4 py-4 text-center">
        <UserAvatar :user="user" size="lg" :show-name="false" />
        <div>
          <p class="text-xl font-bold">{{ user?.fullName }}</p>
          <p class="text-sm text-slate-500 dark:text-slate-400">{{ user?.email }}</p>
        </div>
        <p class="font-mono text-xs text-slate-400">Sitio: {{ siteId }}</p>
      </div>
    </DuiCard>
  </div>
</template>
