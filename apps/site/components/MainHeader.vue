<template>
  <header class="dark:bg-slate-900 shadow-lg relative z-10">
    <div class="container mx-auto flex items-center justify-between p-4">
      <NuxtLink
        to="/"
        title="Droni.co | Desarrollo inteligente"
        class="flex items-center text-slate-700 transition hover:text-slate-900 dark:text-slate-100 dark:hover:text-rose-200"
        aria-label="Droni.co | Desarrollo inteligente"
        tabindex="-1"
        role="link"
        >
          <img src="~/assets/img/logo.svg" alt="Droni.co | Desarrollo inteligente" class="w-8 md:w-8 dark:hidden">
          <img src="~/assets/img/logo-w.svg" alt="Droni.co | Desarrollo inteligente" class="w-8 md:w-8 dark:block hidden">
        <span class="ml-2 leading-none">
          <strong>Droni.co</strong>
          <small class="block text-xm font-normal">
            Desarrollo inteligente
          </small>
        </span>
      </NuxtLink>
      <button
        class="md:hidden text-slate-700 dark:text-slate-100 hover:text-slate-900 dark:hover:text-slate-200"
        @click="toggleMenu = !toggleMenu">
        <i class="mdi mdi-menu text-xl" />
      </button>
      <nav
        :class="{
          'block absolute top-0 left-0 w-full h-screen bg-slate-50 dark:bg-slate-900 dark:bg-slate-800 flex flex-col items-center justify-center': toggleMenu,
          'hidden md:flex text-md space-x-4': !toggleMenu
        }"
        @click="toggleMenu = false"
        @keydown.enter="toggleMenu = false"
        @keydown.space.prevent="toggleMenu = false"
        @keydown.esc="toggleMenu = false"
        >
        <NuxtLink
          v-for="item in menu" :key="item.name"
          :title="item.name"
          :to="item.path"
          class="group relative hover:text-pink-600 transition-all duration-300"
          :class="{
            'text-pink-600': route.path.startsWith(item.path),
            'text-slate-700 dark:text-slate-300': !route.path.startsWith(item.path),
            'inline-block': !toggleMenu,
            'block p-2 m-0': toggleMenu
          }"
          >
          <i :class="`mdi ${item.icon}`" />
          {{ item.name }}
          <span class="absolute bottom-0 left-1/2 w-0 h-0.5 bg-pink-600 transform -translate-x-1/2 transition-all duration-300 group-hover:w-full" />
        </NuxtLink>
        <NuxtLink
          v-if="status === 'authenticated'"
          to="/" class="flex text-slate-700 dark:text-slate-300 hover:text-pink-600 transition border border-slate-300 dark:border-slate-600 rounded-full pe-2">
          <img :src="data?.user?.image ?? ''" alt="User Image" class="w-6 h-6 rounded-full mr-1">
          <span>{{ data?.user?.name }}</span>
        </NuxtLink>
        <NuxtLink
          v-if="status !== 'authenticated'"
          class="group relative inline-block text-slate-700 dark:text-slate-300 hover:text-pink-600 transition cursor-pointer"
          @click="signIn('google')">
          <i class="mdi mdi-google" />
          Ingresa
          <span class="absolute bottom-0 left-1/2 w-0 h-0.5 bg-pink-600 transform -translate-x-1/2 transition group-hover:w-full" />
        </NuxtLink>
        <div class="flex items-center space-x-2">
          <button
            v-if="status === 'authenticated'"
            class="text-slate-700 hover:text-pink-600 dark:text-slate-100 dark:hover:text-pink-900 transition cursor-pointer"
            @click="closeSession">
            <i class="mdi mdi-logout" />
          </button>
          <button
            class="text-slate-700 hover:text-slate-900 dark:text-slate-100 dark:hover:text-slate-200 hover:opacity-75 cursor-pointer"
            @click="changeColorMode"
            >
            <i class="mdi mdi-theme-light-dark" />
          </button>
        </div>
      </nav>
    </div>
  </header>
</template>
<script setup lang="ts">
const colorMode = useColorMode()
const route = useRoute()
const { status, data, signIn, signOut   } = useAuth()
const toggleMenu = ref(false)

const closeSession = () => {
  signOut()
}

const changeColorMode = () => {
  colorMode.preference = colorMode.preference === 'dark' ? 'light' : 'dark'
}

const menu = [
  { name: 'Blog', icon: 'mdi-newspaper-variant-multiple-outline', path: '/blog' },
  { name: 'Proyectos', icon: 'mdi-developer-board', path: '/proyectos' },
  { name: 'Code lab', icon: 'mdi-test-tube-empty', path: '/codelab' },
  { name: 'Cursos', icon: 'mdi-school-outline', path: '/cursos' },
  { name: 'Live', icon: 'mdi-youtube', path: '/live' }
]

</script>