<template>
  <div v-if="mod">
    <UiHero>
      <div class="text-center md:text-start py-6">
        <p class="text-xs font-bold uppercase tracking-[0.28em] text-pink-600 dark:text-pink-400 mb-2">
          <NuxtLink to="/proyectos/appi">Appi</NuxtLink> · Referencia
        </p>
        <h1 class="text-balance lg:text-4xl text-gray-800 drop-shadow-lg dark:text-gray-50">
          <i :class="mod.icon" /> {{ mod.name }}
        </h1>
        <h4 class="text-balance text-sm lg:text-lg text-gray-800 drop-shadow-lg dark:text-gray-50">
          {{ mod.summary }}
        </h4>
      </div>
    </UiHero>

    <div class="container mx-auto px-4 py-8 grid gap-8 lg:grid-cols-[14rem_1fr]">
      <aside class="lg:sticky lg:top-20 lg:self-start">
        <AppiNav :current="mod.slug" />
      </aside>

      <div class="min-w-0 max-w-5xl">
        <section class="space-y-3 mb-10">
          <p v-for="paragraph in mod.intro" :key="paragraph" class="text-zinc-600 dark:text-zinc-300">
            {{ paragraph }}
          </p>
        </section>

        <section v-for="group in mod.groups" :id="group.id" :key="group.id" class="scroll-mt-24 mb-12">
          <div class="flex flex-wrap items-center gap-3 mb-2">
            <h2 class="text-2xl font-bold">{{ group.title }}</h2>
            <span
              v-if="group.admin"
              class="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
            >
              Solo owner del sitio
            </span>
          </div>
          <p v-if="group.description" class="text-zinc-600 dark:text-zinc-300 mb-4">{{ group.description }}</p>

          <div v-if="group.admin" class="mb-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 p-4 text-sm text-zinc-600 dark:text-zinc-300">
            <i class="mdi mdi-shield-lock-outline text-rose-500" />
            Estas rutas solo responden a usuarios con rol owner. Úsalas desde un panel de administración privado,
            nunca desde el frontend público de tu sitio.
          </div>

          <div class="space-y-4">
            <AppiEndpoint v-for="endpoint in group.endpoints" :key="endpoint.id" :endpoint="endpoint" />
          </div>
        </section>

        <nav class="flex justify-between gap-4 border-t border-zinc-200 dark:border-zinc-700 pt-6 text-sm font-semibold">
          <NuxtLink :to="prev ? `/proyectos/appi/${prev.slug}` : '/proyectos/appi'" class="text-pink-600 dark:text-pink-400">
            <i class="mdi mdi-arrow-left" /> {{ prev?.name ?? 'Primeros pasos' }}
          </NuxtLink>
          <NuxtLink v-if="next" :to="`/proyectos/appi/${next.slug}`" class="text-pink-600 dark:text-pink-400">
            {{ next.name }} <i class="mdi mdi-arrow-right" />
          </NuxtLink>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { appiModules, findAppiModule } from '~/data/appiDocs'

const route = useRoute()

// Reactive on route.params: Nuxt reuses this instance across /proyectos/appi/[module] siblings
const mod = computed(() => findAppiModule(String(route.params.module)))
const index = computed(() => appiModules.findIndex((m) => m.slug === mod.value?.slug))
const prev = computed(() => (index.value > 0 ? appiModules[index.value - 1] : undefined))
const next = computed(() => appiModules[index.value + 1])

if (!mod.value) {
  throw createError({ statusCode: 404, statusMessage: 'Módulo no encontrado', fatal: true })
}

useSeoMeta({
  title: () => `Appi · ${mod.value?.name} | Droni.co`,
  ogTitle: () => `Appi · ${mod.value?.name} | Droni.co`,
  description: () => mod.value?.summary,
  ogDescription: () => mod.value?.summary,
})
</script>
