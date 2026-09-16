<template>
  <DuiNavbar :items="navItems" underline-color="secondary" class="z-10">
    <template #brand>
      <NuxtLink
        to="/"
        title="Droni.co | Desarrollo inteligente"
        class="flex items-center text-slate-700 dark:text-slate-100 transition hover:opacity-80"
        aria-label="Droni.co | Desarrollo inteligente"
      >
        <img src="~/assets/img/logo.svg" alt="" class="w-8 dark:hidden">
        <img src="~/assets/img/logo-w.svg" alt="" class="w-8 hidden dark:block">
        <span class="ml-2 leading-none">
          <strong>Droni.co</strong>
          <small class="block text-xs font-normal">Desarrollo inteligente</small>
        </span>
      </NuxtLink>
    </template>

    <template #actions>
      <ClientOnly>
        <NuxtLink
          v-if="status === 'authenticated'"
          to="/"
          class="flex items-center gap-1 text-sm text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-full px-2 py-0.5 hover:text-pink-600 transition"
        >
          <img v-if="user?.avatar" :src="user.avatar" alt="" class="w-5 h-5 rounded-full">
          <span>{{ displayName }}</span>
        </NuxtLink>
        <NuxtLink
          v-else
          to="/login"
          class="text-sm text-slate-700 dark:text-slate-300 hover:text-pink-600 transition"
        >
          <i class="mdi mdi-login" /> Ingresa
        </NuxtLink>
        <button
          v-if="status === 'authenticated'"
          class="text-slate-600 dark:text-slate-300 hover:text-pink-600 dark:hover:text-pink-400 transition cursor-pointer"
          title="Cerrar sesión"
          @click="logout"
        >
          <i class="mdi mdi-logout" />
        </button>
        <button
          class="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition cursor-pointer"
          title="Cambiar tema"
          @click="toggleColorMode"
        >
          <i class="mdi mdi-theme-light-dark" />
        </button>
      </ClientOnly>
    </template>
  </DuiNavbar>
</template>

<script setup lang="ts">
import { DuiNavbar } from '@dronico/droni-kit'

const colorMode = useColorMode()
const route = useRoute()
const { status, user, logout } = useSiteAuth()

const displayName = computed(() =>
  user.value?.fullName ?? user.value?.name ?? user.value?.email ?? 'Cuenta',
)

function toggleColorMode() {
  colorMode.preference = colorMode.preference === 'dark' ? 'light' : 'dark'
}

const navItems = [
  {
    label: 'Blog',
    icon: 'mdi mdi-newspaper-variant-multiple-outline',
    to: '/blog',
    active: route.path.startsWith('/blog')
  },
  {
    label: 'Proyectos',
    icon: 'mdi mdi-developer-board',
    to: '/proyectos',
    active: route.path.startsWith('/proyectos')
  },
  {
    label: 'Code lab',
    icon: 'mdi mdi-test-tube-empty',
    to: '/codelab',
    active: route.path.startsWith('/codelab'),
    children: [
      {
        icon: 'mdi mdi-code-tags',
        label: 'Desafíos de programación',
        to: '/codelab/desafios',
        active: route.path.startsWith('/codelab/desafios')
      },
      {
        icon: 'mdi mdi-code-json',
        label: 'JSON a TypeScript',
        to: '/codelab/json-to-ts',
        active: route.path.startsWith('/codelab/json-to-ts')
      },
      {
        icon: 'mdi mdi-lock',
        label: 'Decodificar JWT',
        to: '/codelab/decode-jwt',
        active: route.path.startsWith('/codelab/decode-jwt')
      },
      {
        icon: 'mdi mdi-cpu-64-bit',
        label: 'Convertidor Base64',
        to: '/codelab/base64',
        active: route.path.startsWith('/codelab/base64')
      },
      {
        icon: 'mdi mdi-code-braces',
        label: 'Formateador de código',
        to: '/codelab/formatter',
        active: route.path.startsWith('/codelab/formatter')
      },
      {
        icon: 'mdi mdi-file-delimited',
        label: 'Convertidor JSON ↔ CSV',
        to: '/codelab/json-csv',
        active: route.path.startsWith('/codelab/json-csv')
      },
      {
        icon: 'mdi mdi-swap-vertical-circle-outline',
        label: 'Visor Swagger',
        to: '/codelab/swagger-viewer',
        active: route.path.startsWith('/codelab/swagger-viewer')
      },
      {
        icon: 'mdi mdi-tools',
        label: 'Utilidades y generadores',
        to: '/codelab/mini-converters',
        active: route.path.startsWith('/codelab/mini-converters')
      }
    ]
  },
  {
    label: 'Cursos',
    icon: 'mdi mdi-school-outline',
    to: '/cursos',
    active: route.path.startsWith('/cursos')
  },
  {
    label: 'Live',
    icon: 'mdi mdi-youtube',
    to: '/live',
    active: route.path.startsWith('/live')
  }
]
</script>
