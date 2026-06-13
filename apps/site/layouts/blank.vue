<template>
  <div
    class="min-h-screen text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
    >
    <NuxtLoadingIndicator color="#ed1f9b" />
    <NuxtRouteAnnouncer />
    <UiToast />
    <slot />
  </div>
</template>
