<template>
  <div class="md:flex">
    <div class="grow">
      <iframe
        class="w-full aspect-video"
        title="dronico"
        src="https://player.twitch.tv/?channel=dronico&parent=droni.co"
        allowfullscreen="true" />
    </div>
    <div>
      <iframe
        class="w-full h-dvh md:h-full"
        title="chat"
        src="https://www.twitch.tv/embed/dronico/chat?parent=droni.co" />
    </div>
  </div>
</template>
<script setup lang="ts">
useSeoMeta({
  title: 'Droni.co | Live',
  ogTitle: 'Droni.co | Live',
  description: 'Estamos en vivo con el mejor contenido de desarrollo web y tecnología.',
  ogDescription: 'Estamos en vivo con el mejor contenido de desarrollo web y tecnología.',
  ogImage: 'https://dronico.nyc3.digitaloceanspaces.com/4ebaccf5-b863-4f12-aa49-9bbe0e1844e2/db7d4d54-7354-4421-9682-d1b75b1f1413/74529-dronico-card.png.png',
  twitterCard: 'summary_large_image',
})
</script>
