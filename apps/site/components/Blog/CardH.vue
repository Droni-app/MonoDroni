<template>
  <div class="flex flex-col md:flex-row bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden max-w-4xl w-full hover:scale-105 transition-transform">
    <!-- Imagen -->
    <NuxtLink :to="`/blog/${props.post.slug}`" :title="`Ver ${props.post.name}`" class="md:w-1/4 w-full h-48 md:h-auto">
      <NuxtImg
        v-if="post.picture"
        :src="post.picture"
        class="object-cover w-full h-full"
        :alt="post.name" />
    </NuxtLink>

    <!-- Contenido -->
    <div class="p-6 md:w-3/4 flex flex-col justify-between bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      <div class="text-start">
        <NuxtLink :to="`/blog/${props.post.slug}`" :title="`Ver ${props.post.name}`">
          <h2 class="text-lg font-bold mb-2">
            {{ props.post.name }}
          </h2>
        </NuxtLink>
        <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {{ props.post.description }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  post: Post
}>()
</script>