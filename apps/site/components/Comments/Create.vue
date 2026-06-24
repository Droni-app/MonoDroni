<template>
  <div>
    <DuiTextarea
      v-model="content"
      block
      label="Escribe un comentario..."
      required
      placeholder="Puedes usar formato markdown..." />
    <DuiButton
      color="primary"
      :disabled="submitting || !content.trim()"
      @click="createComment">
      <i class="mdi mdi-send" />
      {{ submitting ? 'Enviando...' : 'Enviar comentario' }}
    </DuiButton>
  </div>
</template>
<script setup lang="ts">
import { DuiTextarea, DuiButton } from '@dronico/droni-kit'

const props = defineProps<{
  commentable: string
  commentableId: string
  parentId: string | null
}>()

const emit = defineEmits<{
  created: [comment: {
    id: string
    parentId: string | null
    content: string
    isEdited: number
    active: number
    createdAt: string
    user: { fullName: string; avatar: string | null }
    children: []
    _optimistic: true
  }]
}>()

const { user } = useSiteAuth()
const content = ref('')
const submitting = ref(false)

async function createComment() {
  if (!content.value.trim()) return
  submitting.value = true

  const optimistic = {
    id: `temp-${Date.now()}`,
    parentId: props.parentId,
    content: content.value,
    isEdited: 0 as const,
    active: 1 as const,
    createdAt: new Date().toISOString(),
    user: { fullName: user.value?.fullName ?? '', avatar: user.value?.avatar ?? null },
    children: [] as [],
    _optimistic: true as const,
  }

  content.value = ''
  emit('created', optimistic)

  try {
    await $fetch('/api/appi/social/comments', {
      method: 'POST',
      body: {
        commentable_type: props.commentable,
        commentable_id: props.commentableId,
        parent_id: props.parentId,
        content: optimistic.content,
      },
    })
  } catch (error) {
    console.error(error)
  } finally {
    submitting.value = false
  }
}
</script>
