<template>
  <article 
    v-if="props.post"
    class="bg-white border border-gray-200 rounded shadow dark:bg-gray-800 dark:border-gray-700
    hover:scale-105 transition-transform">
    <NuxtLink :to="`/blog/${props.post.slug}`">
      <NuxtImg :src="props.post.picture ?? ''" class="w-full rounded-t aspect-video object-cover" :alt="props.post.name" />
    </NuxtLink>
    <div class="p-5">
      <NuxtLink :to="`/blog/${props.post.slug}`">
        <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-700 dark:text-gray-100 hover:text-gray-900 dark:hover:text-gray-300">
          {{ props.post.name }}
        </h5>
      </NuxtLink>
      <p class="mb-3 font-normal text-gray-600 dark:text-gray-300">
        <small class="text-gray-500 dark:text-gray-400 block">
          By {{ props.post.user?.name }} | {{ props.post.created_at }}
        </small>
        {{ props.post.description }}
      </p>
    </div>
  </article>
</template>
<script setup lang="ts">
const props = defineProps<{
  post: Post
}>()
</script>