<script setup lang="ts">
withDefaults(defineProps<{
  user?: { fullName?: string | null; avatar?: string | null; email?: string | null } | null
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
}>(), {
  user: null,
  size: 'sm',
  showName: true,
})

const sizes = { sm: 'h-7 w-7 text-xs', md: 'h-9 w-9 text-sm', lg: 'h-20 w-20 text-2xl' }
</script>

<template>
  <span class="inline-flex min-w-0 items-center gap-2">
    <img
      v-if="user?.avatar"
      :src="user.avatar"
      :alt="user.fullName ?? ''"
      :class="sizes[size]"
      class="shrink-0 rounded-full object-cover"
    />
    <span
      v-else
      :class="sizes[size]"
      class="flex shrink-0 items-center justify-center rounded-full bg-slate-200 font-semibold uppercase text-slate-600 dark:bg-slate-700 dark:text-slate-200"
    >
      {{ user?.fullName?.charAt(0) ?? '?' }}
    </span>
    <span v-if="showName" class="truncate text-sm">{{ user?.fullName ?? 'Invitado' }}</span>
  </span>
</template>
