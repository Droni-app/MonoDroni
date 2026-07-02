<script setup lang="ts">
import { computed } from 'vue'
import { DuiNavbar, DuiButton } from '@dronico/droni-kit'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useTheme } from '../composables/useTheme'
import logoLight from '../assets/img/logo.svg'
import logoDark from '../assets/img/logo-w.svg'

const router = useRouter()
const { logout, user } = useAuth()
const { theme, toggleTheme } = useTheme()

const logo = computed(() => theme.value === 'dark' ? logoDark : logoLight)

const items = [
  {
    label: 'Content',
    children: [
      { label: 'Posts', to: '/content/posts' },
      { label: 'Attachments', to: '/content/attachments' },
    ],
  },
  {
    label: 'Social',
    children: [
      { label: 'Comments', to: '/social/comments' },
      { label: 'Topics', to: '/social/topics' },
    ],
  },
  {
    label: 'Store',
    children: [
      { label: 'Productos', to: '/store/products' },
      { label: 'Pedidos', to: '/store/orders' },
      { label: 'Pagos', to: '/store/payments' },
      { label: 'Cupones', to: '/store/coupons' },
      { label: 'Reglas de envío', to: '/store/shipping-rules' },
    ],
  },
]

function handleLogout() {
  logout()
  router.push('/login')
}
</script>

<template>
  <DuiNavbar :items="items">
    <template #brand>
      <img :src="logo" alt="Droni" class="h-8 w-auto" />
    </template>
    <template #actions>
      <RouterLink to="/profile" class="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 dark:text-white/80 dark:hover:text-white transition-colors">
        <img
          v-if="user?.avatar"
          :src="user.avatar"
          :alt="user.fullName"
          class="h-8 w-8 rounded-full object-cover"
        />
        <span v-else class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-700 dark:bg-white/20 dark:text-white text-xs font-semibold uppercase">
          {{ user?.fullName?.charAt(0) ?? '?' }}
        </span>
        <span class="hidden sm:block font-medium">{{ user?.fullName }}</span>
      </RouterLink>
      <DuiButton color="secondary" size="sm" @click="toggleTheme">
        <i :class="theme === 'dark' ? 'mdi mdi-weather-sunny' : 'mdi mdi-weather-night'" />
      </DuiButton>
      <DuiButton color="danger" size="sm" @click="handleLogout">
        <i class="mdi mdi-logout" />
      </DuiButton>
    </template>
  </DuiNavbar>
</template>
