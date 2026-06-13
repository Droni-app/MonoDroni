<template>
  <div>
    <DuiTextarea
      v-model="newComment.content"
      block
      label="Escribe un comentario..."
      required
      placeholder="Puedes usar formato markdown..." />
    <DuiButton
      color="primary"
      @click="createComment">
      <i class="mdi mdi-send" />
      Enviar comentario
    </DuiButton>
  </div>
</template>
<script setup lang="ts">
import { DuiTextarea, DuiButton } from '@dronico/droni-kit';
const props = defineProps<{
  commentable: 'content_post' | 'codevs_challenge' | 'codevs_submission',
  commentableId: number,
  parentId: number | null
}>()

const content = ref<string>('')

const newComment = ref<{
  commentable: 'content_post' | 'codevs_challenge' | 'codevs_submission',
  commentable_id: number,
  parent_id: number | null,
  content: string
}>({
  commentable: props.commentable,
  commentable_id: props.commentableId,
  parent_id: props.parentId ?? null,
  content: ''
})

const createComment = () => {
  $fetch(`/api/appi/social/comments`, {
    method: 'POST',
    body: newComment.value,
  }).then((comment) => {
    console.log(comment)
    content.value = ''
    newComment.value.parent_id = null
    newComment.value.content = ''
  }).catch((error) => {
    console.error(error)
  })
}

</script>