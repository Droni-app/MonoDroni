<!-- eslint-disable vue/no-v-html -->
<template>
  <article
    class="bg-slate-150 dark:bg-slate-800 shadow-xl rounded mb-2 p-2 border-l-2 border-l-purple-500"
    :class="props.comment?.approved_at === null ? 'border-l-rose-500' : ''">
    <header class="flex">
      <UiPill>
        <div class="flex">
          <NuxtImg :src="props.comment?.user?.avatar ?? ''" alt="User Image" class="w-4 h-4 rounded-full mr-1" />
          <span>{{ props.comment?.user?.name }}</span>
        </div>
      </UiPill>

      <UiPill>
        <i class="mdi mdi-clock-outline me-1" />
        <time :datetime="props.comment.created_at">
          {{ new Date(props.comment.created_at).toLocaleString() }}
        </time>
      </UiPill>

      <UiPill v-if="status === 'authenticated' && props.comment.parent_id === null" class="cursor-pointer" @click="responseBox = !responseBox">
        <i class="mdi mdi-reply" />
        Reponder
      </UiPill>
      <UiPill v-if="status === 'authenticated' && props.comment.approved_at === null" class="cursor-pointer" @click="aprobar(props.comment.id)">
        <i class="mdi mdi-check" />
        Aprobar
      </UiPill>
    </header>
    <div class="prose prose-sm max-w-full dark:prose-invert" v-html="markdown.render(props.comment.content)" />
    <CommentsCreate
      v-if="status === 'authenticated' && responseBox"
      class="mb-2"
      :commentable="props.commentable"
      :commentable-id="props.commentableId"
      :parent-id="props.comment.id" />
    <CommentsCard
      v-for="child in props.comment.children"
      :key="child.id"
      :comment="child"
      :parent-id="props.comment.id"
      :commentable="props.commentable"
      :commentable-id="props.commentableId" />
  </article>
</template>
<script setup lang="ts">
import MarkdownIt from "markdown-it";
const markdown = new MarkdownIt();
const { status } = useAuth()
const props = defineProps<{
  comment: Comment,
  commentable: 'content_post' | 'codevs_challenge' | 'codevs_submission',
  commentableId: number,
}>()
const responseBox = ref(false)

const aprobar = (id: number) => {
  $fetch(`/api/appi/social/comments/${id}`, {
    method: 'PUT',
    body: {
      approved: true,
    },
  }).then((comment) => {
    console.log(comment)
  }).catch((error) => {
    console.error(error)
  })
}
</script>