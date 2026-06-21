<template>
  <DuiCard
    v-if="props.post"
    :image="props.post.picture ?? ''"
    :title="props.post.name"
    :subtitle="props.post.description"
    :to="`/blog/${props.post.slug}`"
    size="m"
  />
</template>
<script setup lang="ts">
import { DuiCard } from '@dronico/droni-kit'
const props = defineProps<{
  post: Post
}>()
</script>
