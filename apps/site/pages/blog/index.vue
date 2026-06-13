<template>
  <div>
    <UiHero>
      <div class="text-center md:text-start py-6">
        <h1 class="text-balance text-xl lg:text-4xl text-gray-800 drop-shadow-lg dark:text-gray-50">
          Blog de Droni.co
        </h1>
        <h4 class="text-balance text-sm lg:text-lg text-gray-800 drop-shadow-lg dark:text-gray-50">
          Compartimos el conocimiento y la experiencia contigo.
        </h4>
      </div>
    </UiHero>
    <div class="container mx-auto px-2 py-3">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <BlogCard
          v-for="post in posts?.data || []"
          :key="post.id"
          :post="post"
          />
      </div>
      <div class="text-center py-3">
        <DuiButton @click="morePosts">
          <i class="mdi mdi-plus" />
          Ver más...
        </DuiButton>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { DuiButton } from '@dronico/droni-kit'
const filters = ref({ page: 1, itemsPerPage: 12 })
const { data: posts } = await useFetch<Pagination<Post[]>>(`/api/appi/content/posts?perPage=${filters.value.itemsPerPage}&category=blog`)
const morePosts = () => {
  filters.value.page++
  getPosts({npage: filters.value.page, nperPage: filters.value.itemsPerPage})  
}
const getPosts = async ({npage=1, nperPage=20}) => {
  filters.value = { itemsPerPage: nperPage, page: npage }
  const data = await $fetch<Pagination<Post[]>>(`/api/appi/content/posts?perPage=${filters.value.itemsPerPage}&page=${filters.value.page}&category=blog`)
  if (posts.value) {
    posts.value.data = [...posts.value.data, ...data.data]
  }
  filters.value.page = data.current_page
  filters.value.itemsPerPage = data.per_page
}

useSeoMeta({
  title: 'Blog | Droni.co',
  ogTitle: 'Blog | Droni.co',
  description: 'Compartimos nuestro conocimiento y experiencia contigo.',
  ogDescription: 'Compartimos nuestro conocimiento y experiencia contigo.',
  ogImage: 'https://dronico.nyc3.digitaloceanspaces.com/4ebaccf5-b863-4f12-aa49-9bbe0e1844e2/db7d4d54-7354-4421-9682-d1b75b1f1413/74529-dronico-card.png.png',
  twitterCard: 'summary_large_image',
})

</script>