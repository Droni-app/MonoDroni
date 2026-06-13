<template>
  <div>
    <CommentsCreate
      v-if="status === 'authenticated'"
      class="mb-2"
      :commentable="props.commentable"
      :commentable-id="props.commentableId"
      :parent-id="null" />
    <CommentsCard
      v-for="comment in comments?.data"
      :key="comment.id"
      :comment="comment"
      :parent-id="parentId"
      :commentable="props.commentable"
      :commentable-id="props.commentableId"
      @reply="parentId = comment.id" />
  </div>
</template>
<script setup lang="ts">
const { status } = useAuth()
const parentId = ref<number | null>(null)
const props = defineProps<{
  commentable: 'content_post' | 'codevs_challenge' | 'codevs_submission',
  commentableId: number
}>()

const comments = useFetch<Pagination<Comment[]>>(`/api/appi/social/comments?commentable=${props.commentable}&commentable_id=${props.commentableId}`).data
</script>