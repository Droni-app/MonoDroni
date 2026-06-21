<template>
  <DuiCard
    v-if="props.post"
    :image="props.post.picture ?? ''"
    :title="props.post.name"
    :to="`/blog/${props.post.slug}`"
    size="l"
  >
    <small class="text-gray-500 dark:text-gray-400 block mb-1">
      By {{ props.post.user?.name }} | {{ props.post.created_at }}
    </small>
    {{ props.post.description }}
  </DuiCard>
</template>
<script setup lang="ts">
import { DuiCard } from '@dronico/droni-kit'
const props = defineProps<{
  post: Post
}>()
</script>
