<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { DuiCard, DuiAlert, DuiSwitch, DuiBadge, useToast } from '@dronico/droni-kit'
import AppiService, { apiError } from '../../../services/AppiService'
import { useFetchItem } from '../../../composables/useFetchItem'
import { formatDateTime } from '../../../utils/format'
import PageHeader from '../../../components/ui/PageHeader.vue'
import UserAvatar from '../../../components/ui/UserAvatar.vue'
import ConfirmDelete from '../../../components/ui/ConfirmDelete.vue'
import type { Comment } from '../../../types/AppiService'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const url = `/admin/social/comments/${route.params.id}`
const { item: comment, error } = useFetchItem<Comment>(url)
const saving = ref(false)

// Admins can only moderate (show/hide) comments, not edit their content.
async function setActive(active: boolean) {
  saving.value = true
  try {
    await AppiService.patch(url, { active })
    comment.value!.active = active
    toast.success(active ? 'Comentario visible.' : 'Comentario oculto.')
  } catch (e) {
    toast.error(apiError(e, 'Error al actualizar el comentario.'))
  } finally {
    saving.value = false
  }
}

async function remove() {
  try {
    await AppiService.delete(url)
    toast.success('Comentario eliminado.')
    router.push('/social/comments')
  } catch (e) {
    toast.error(apiError(e, 'Error al eliminar el comentario.'))
  }
}
</script>

<template>
  <PageHeader title="Comentario" back="/social/comments">
    <ConfirmDelete v-if="comment" :action="remove" message="¿Eliminar este comentario? Sus respuestas también podrían perderse." />
  </PageHeader>

  <DuiAlert v-if="error" color="danger">{{ error }}</DuiAlert>
  <p v-else-if="!comment" class="text-slate-500">Cargando...</p>

  <div v-else class="grid items-start gap-6 lg:grid-cols-3">
    <div class="flex flex-col gap-6 lg:col-span-2">
      <DuiCard v-if="comment.parent" title="En respuesta a">
        <UserAvatar :user="comment.parent.user" />
        <p class="mt-2 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">{{ comment.parent.content }}</p>
        <RouterLink :to="`/social/comments/${comment.parent.id}`" class="mt-2 inline-block text-xs text-blue-500 hover:underline">
          Ver comentario padre
        </RouterLink>
      </DuiCard>

      <DuiCard>
        <div class="flex flex-wrap items-center gap-2">
          <UserAvatar :user="comment.user" size="md" />
          <span class="text-xs text-slate-400">{{ formatDateTime(comment.createdAt) }}</span>
          <DuiBadge v-if="comment.isEdited" label="editado" size="xs" />
        </div>
        <p class="mt-4 whitespace-pre-wrap">{{ comment.content }}</p>
      </DuiCard>

      <DuiCard :title="`Respuestas (${comment.children?.length ?? 0})`">
        <p v-if="!comment.children?.length" class="text-sm text-slate-400">Sin respuestas.</p>
        <ul class="divide-y divide-slate-200 dark:divide-slate-700">
          <li v-for="child in comment.children" :key="child.id" class="py-3">
            <div class="flex items-center gap-2">
              <UserAvatar :user="child.user" />
              <span class="text-xs text-slate-400">{{ formatDateTime(child.createdAt) }}</span>
              <RouterLink :to="`/social/comments/${child.id}`" class="ml-auto text-xs text-blue-500 hover:underline">Abrir</RouterLink>
            </div>
            <p class="mt-1 whitespace-pre-wrap text-sm">{{ child.content }}</p>
          </li>
        </ul>
      </DuiCard>
    </div>

    <DuiCard title="Moderación">
      <div class="flex flex-col gap-4 text-sm">
        <DuiSwitch
          :model-value="!!comment.active"
          :disabled="saving"
          label="Visible en el sitio"
          color="success"
          @update:model-value="setActive"
        />
        <dl class="grid grid-cols-3 gap-2">
          <dt class="text-slate-500">Recurso</dt>
          <dd class="col-span-2">{{ comment.commentableType ?? '—' }}</dd>
          <dt class="text-slate-500">ID recurso</dt>
          <dd class="col-span-2 truncate font-mono text-xs">{{ comment.commentableId ?? '—' }}</dd>
        </dl>
      </div>
    </DuiCard>
  </div>
</template>
