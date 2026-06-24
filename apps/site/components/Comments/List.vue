<template>
  <div>
    <DuiAlert v-if="status !== 'authenticated'" color="warning" class="mb-2">
      Debes iniciar sesion para comentar.
    </DuiAlert>
    <CommentsCreate
      v-if="status === 'authenticated'"
      class="mb-2"
      :commentable="props.commentable"
      :commentable-id="props.commentableId"
      :parent-id="null"
      @created="addOptimistic" />
    <CommentsCard
      v-for="comment in comments"
      :key="comment.id"
      :comment="comment"
      :commentable="props.commentable"
      :commentable-id="props.commentableId" />
  </div>
</template>
<script setup lang="ts">
import { DuiAlert } from '@dronico/droni-kit'

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

const { status } = useSiteAuth()
const props = defineProps<{
  commentable: string
  commentableId: string
}>()

const { data: fetched } = await useFetch<{ data: CommentItem[] }>(
  `/api/appi/social/comments?commentable_type=${props.commentable}&commentable_id=${props.commentableId}`
)

const comments = ref<CommentItem[]>(fetched.value?.data ?? [])

watch(() => fetched.value?.data, (val) => {
  if (val) comments.value = val
})

function addOptimistic(comment: CommentItem) {
  comments.value.push(comment)
}
</script>
