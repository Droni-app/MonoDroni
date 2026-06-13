<script setup lang="ts">
import { DuiCard } from '@dronico/droni-kit'
import { useAuth } from '../composables/useAuth'

const { user } = useAuth()
</script>

<template>
  <div class="p-6 max-w-lg mx-auto">
    <DuiCard>
      <div class="flex flex-col items-center gap-4 py-4">
        <img
          v-if="user?.avatar"
          :src="user.avatar"
          :alt="user.fullName"
          class="h-24 w-24 rounded-full object-cover"
        />
        <span v-else class="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 text-3xl font-semibold uppercase text-gray-600">
          {{ user?.fullName?.charAt(0) ?? '?' }}
        </span>
        <div class="text-center">
          <h1 class="text-xl font-bold">{{ user?.fullName }}</h1>
          <p class="text-sm text-gray-500">{{ user?.email }}</p>
        </div>
      </div>
    </DuiCard>
  </div>
</template>
