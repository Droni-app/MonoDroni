<template>
  <div
    class="min-h-screen text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
    >
    <NuxtLoadingIndicator color="#ed1f9b" />
    <NuxtRouteAnnouncer />
    <MainHeader />
    <slot />
    <footer class="bg-gray-300 text-gray-700 dark:bg-black">
      <div class="container mx-auto py-6 px-3 text-center">
        <p class="text-sm">
          <i class="mdi mdi-copyleft" /> 2025 Construido con trabajo duro y
          mucho café por el equipo de Droni.co.
          <NuxtLink to="/legal" title="Legal"> Legal </NuxtLink>
        </p>
        <a
          href="https://twitter.com/droni_co"
          class="transition inline-block p-3 text-blue-400 hover:text-blue-300 text-2xl"
        >
          <i class="mdi mdi-twitter" />
        </a>
        <a
          href="https://www.facebook.com/fan.droni.co/"
          class="transition inline-block p-3 text-blue-400 hover:text-blue-300 text-2xl"
        >
          <i class="mdi mdi-facebook" />
        </a>
        <a
          href="https://co.linkedin.com/company/droni-co"
          class="transition inline-block p-3 text-blue-400 hover:text-blue-300 text-2xl"
        >
          <i class="mdi mdi-linkedin" />
        </a>
      </div>
    </footer>
  </div>
</template>
