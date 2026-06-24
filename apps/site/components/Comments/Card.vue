<!-- eslint-disable vue/no-v-html -->
<template>
  <article
    class="bg-slate-150 dark:bg-slate-800 shadow-xl rounded mb-2 p-2 border-l-2"
    :class="props.comment._optimistic ? 'border-l-slate-400 opacity-70' : 'border-l-purple-500'">
    <header class="flex flex-wrap gap-1">
      <UiPill>
        <div class="flex">
          <NuxtImg v-if="props.comment?.user?.avatar" :src="props.comment.user.avatar" alt="User Image" class="w-4 h-4 rounded-full mr-1" />
          <i v-else class="mdi mdi-account-circle text-base mr-1" />
          <span>{{ props.comment?.user?.fullName }}</span>
        </div>
      </UiPill>

      <UiPill>
        <i class="mdi mdi-clock-outline me-1" />
        <time :datetime="props.comment.createdAt">
          {{ new Date(props.comment.createdAt).toLocaleString() }}
        </time>
      </UiPill>

      <UiPill v-if="props.comment._optimistic">
        <i class="mdi mdi-clock-outline me-1" />
        Enviando...
      </UiPill>

      <UiPill
        v-if="status === 'authenticated' && props.comment.parentId === null && !props.comment._optimistic"
        class="cursor-pointer"
        @click="responseBox = !responseBox">
        <i class="mdi mdi-reply" />
        Responder
      </UiPill>
    </header>

    <div class="prose prose-sm max-w-full dark:prose-invert" v-html="markdown.render(props.comment.content)" />

    <CommentsCreate
      v-if="status === 'authenticated' && responseBox"
      class="mt-2"
      :commentable="props.commentable"
      :commentable-id="props.commentableId"
      :parent-id="props.comment.id"
      @created="addReply" />

    <CommentsCard
      v-for="child in children"
      :key="child.id"
      :comment="child"
      :commentable="props.commentable"
      :commentable-id="props.commentableId" />
  </article>
</template>
<script setup lang="ts">
import MarkdownIt from 'markdown-it'

const markdown = new MarkdownIt()
const { status } = useSiteAuth()

type CommentItem = {
  id: string
  parentId: string | null
  content: string
  isEdited: number
  active: number
  createdAt: string
  user: { fullName: string; avatar: string | null }
  children?: CommentItem[]
  _optimistic?: boolean
}

const props = defineProps<{
  comment: CommentItem
  commentable: string
  commentableId: string
}>()

const responseBox = ref(false)
const children = ref<CommentItem[]>(props.comment.children ?? [])

watch(() => props.comment.children, (val) => {
  if (val) children.value = val
})

function addReply(comment: CommentItem) {
  children.value.push(comment)
  responseBox.value = false
}
</script>
