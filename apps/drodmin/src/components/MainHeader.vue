<script setup lang="ts">
import { computed } from 'vue'
import { DuiNavbar, DuiButton } from '@dronico/droni-kit'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useTheme } from '../composables/useTheme'
import { modules } from '../navigation'
import UserAvatar from './ui/UserAvatar.vue'
import logoLight from '../assets/img/logo.svg'
import logoDark from '../assets/img/logo-w.svg'

const router = useRouter()
const { logout, user } = useAuth()
const { theme, toggleTheme } = useTheme()

// DuiNavbar renders `icon` as plain text, so the navbar gets the items without icons
const navItems = modules.map(({ label, children }) => ({
  label,
  children: children.map(({ label, to }) => ({ label, to })),
}))

const logo = computed(() => theme.value === 'dark' ? logoDark : logoLight)

function handleLogout() {
  logout()
  router.push('/login')
}
</script>

<template>
  <DuiNavbar :items="navItems">
    <template #brand>
      <RouterLink to="/">
        <img :src="logo" alt="Droni" class="h-8 w-auto" />
      </RouterLink>
    </template>
    <template #actions>
      <RouterLink to="/profile" class="text-slate-600 transition-colors hover:text-slate-900 dark:text-white/80 dark:hover:text-white">
        <UserAvatar :user="user" size="md" :show-name="false" class="sm:hidden" />
        <UserAvatar :user="user" size="md" class="hidden font-medium sm:inline-flex" />
      </RouterLink>
      <DuiButton variant="ghost" size="sm" :title="theme === 'dark' ? 'Tema claro' : 'Tema oscuro'" @click="toggleTheme">
        <i :class="theme === 'dark' ? 'mdi mdi-weather-sunny' : 'mdi mdi-weather-night'" />
      </DuiButton>
      <DuiButton color="danger" variant="ghost" size="sm" title="Cerrar sesión" @click="handleLogout">
        <i class="mdi mdi-logout" />
      </DuiButton>
    </template>
  </DuiNavbar>
</template>
