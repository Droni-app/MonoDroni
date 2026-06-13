<!-- eslint-disable vue/no-v-html -->
<template>
  <article v-if="post">
    <UiHero>
      <div class="text-center md:text-start py-6 md:flex">
        <div class="grow my-auto">
          <h1 class="text-balance text-3xl lg:text-4xl text-gray-800 drop-shadow-lg dark:text-gray-50">
            {{ post.name }}
          </h1>
          <h4 class="py-2 text-balance">{{ post.description }}</h4>
          <div class="flex">
            <UiPill>
              <div class="flex">
                <NuxtImg :src="post.user.avatar ?? ''" :alt="post.user.name" class="w-4 h-4 rounded-full mr-1" />
                <span>{{ post.user.name }}</span>
              </div>
            </UiPill>
            <UiPill>
              <i class="mdi mdi-calendar" />
              <time :datetime="post.created_at">
                {{ new Date(post.created_at).toLocaleString() }}
              </time>
            </UiPill>
          </div>
        </div>
        <div>
          <NuxtImg
            v-if="post.picture"
            :src="post.picture"
            class="max-w-80 mx-auto bg-slate-100 dark:bg-slate-700 shadow-lg p-2 my-2 rounded"
            :alt="post.name" />
        </div>
      </div>
    </UiHero>
    <div class="container mx-auto">
      <div v-if="getProp('video')" class="aspect-video">
        <iframe
          :src="getVideoUrl(getProp('video'))"
          :title="post.name"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          class="w-full h-full" />
      </div>
    </div>
    <div class="container mx-auto px-2 md:px-auto py-4">
      <article class="prose lg:prose-xl max-w-full dark:prose-invert md:my-8" v-html="markdown.render(String(post.content))" />
    </div>
    <div class="container mx-auto">
      <CommentsList commentable="content_post" :commentable-id="post.id" />
    </div>
  </article>
</template>
<script setup lang="ts">
import MarkdownIt from "markdown-it";
const markdown = new MarkdownIt();
const route = useRoute()
const { data: post } = await useFetch<Post>(`/api/appi/content/posts/${route.params.slug}`)

useHead({
  link: [
    { rel: 'canonical', href: `https://droni.co/blog/${post.value?.slug}` }
  ]
})
useSeoMeta({
  title: () => post.value?.name,
  ogTitle: () => post.value?.name,
  description: () => post.value?.description,
  ogDescription: () => post.value?.description,
  ogType: 'article',
  ogImage: () => post.value?.picture,
  twitterCard: 'summary_large_image',
  ogUrl: () => `https://droni.co/blog/${post.value?.slug}`
})
const getProp = (name: string) => {
  return post.value?.attrs?.find(attr => attr.name === name)?.value ?? ''
}
const getVideoUrl = (video:string) => {
  let videoId = video.split('v=')[1]
  const ampersandPosition = videoId.indexOf('&')
  if (ampersandPosition !== -1) {
    videoId = videoId.substring(0, ampersandPosition)
  }
  return `https://www.youtube.com/embed/${videoId}`
}
</script>