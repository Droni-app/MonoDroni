<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { DuiButton, DuiInput, DuiTextarea, DuiLabel, DuiModal, DuiPagination, DuiBadge, useToast } from '@dronico/droni-kit'
import AppiService, { apiError } from '../../services/AppiService'
import { usePaginatedList } from '../../composables/usePaginatedList'
import { emptyToNull, formatDateTime } from '../../utils/format'
import AttachmentInput from '../AttachmentInput.vue'
import UserPicker from './UserPicker.vue'
import UserAvatar from '../ui/UserAvatar.vue'
import ConfirmDelete from '../ui/ConfirmDelete.vue'
import EmptyState from '../ui/EmptyState.vue'
import type { LearnLessonAnswer, SiteUser } from '../../types/AppiService'

// Students' answers to the lesson activity: review, grade, register manually or delete.
const props = defineProps<{ courseId: string; lessonId: string }>()

const toast = useToast()
const url = `/admin/learn/courses/${props.courseId}/lessons/${props.lessonId}/answers`
const { rows, loading, pagination, fetch } = usePaginatedList<LearnLessonAnswer>(url)

// --- Grade / edit modal (also used to register a new answer) ---
const editing = ref<LearnLessonAnswer | null>(null)
const showModal = ref(false)
const saving = ref(false)
const user = ref<SiteUser | null>(null)
const form = reactive({ answer: '', attachment: null as string | null, feedback: '', result: '' as number | '' })

function openModal(answer: LearnLessonAnswer | null) {
  editing.value = answer
  user.value = null
  Object.assign(form, {
    answer: answer?.answer ?? '',
    attachment: answer?.attachment ?? null,
    feedback: answer?.feedback ?? '',
    result: answer?.result ?? '',
  })
  showModal.value = true
}

async function save() {
  saving.value = true
  try {
    const payload = emptyToNull({ ...form })
    if (editing.value) {
      await AppiService.patch(`${url}/${editing.value.id}`, payload)
      toast.success('Respuesta calificada.')
    } else {
      await AppiService.post(url, { ...payload, user_id: user.value?.id })
      toast.success('Respuesta registrada.')
    }
    showModal.value = false
    fetch(pagination.value.page)
  } catch (e) {
    toast.error(apiError(e, 'Error al guardar la respuesta.'))
  } finally {
    saving.value = false
  }
}

async function remove(answer: LearnLessonAnswer) {
  try {
    await AppiService.delete(`${url}/${answer.id}`)
    toast.success('Respuesta eliminada.')
    fetch(pagination.value.page)
  } catch (e) {
    toast.error(apiError(e, 'Error al eliminar la respuesta.'))
  }
}

onMounted(() => fetch())
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex justify-end">
      <DuiButton variant="outline" size="sm" @click="openModal(null)">
        <i class="mdi mdi-plus mr-1" /> Registrar respuesta
      </DuiButton>
    </div>

    <p v-if="loading && !rows.length" class="text-sm text-slate-500">Cargando...</p>
    <EmptyState v-else-if="!rows.length" icon="mdi-text-box-check-outline" text="Nadie ha respondido la actividad todavía." />

    <ul v-else class="divide-y divide-slate-200 dark:divide-slate-700">
      <li v-for="answer in rows" :key="answer.id" class="flex flex-col gap-2 py-4">
        <div class="flex flex-wrap items-center gap-2">
          <UserAvatar :user="answer.enrollment?.user" />
          <span class="text-xs text-slate-400">{{ formatDateTime(answer.createdAt) }}</span>
          <DuiBadge
            :label="answer.result != null ? `${answer.result}/100` : 'Sin calificar'"
            :color="answer.result != null ? 'success' : 'warning'"
            size="xs"
          />
          <div class="ml-auto flex gap-1">
            <DuiButton variant="ghost" size="sm" @click="openModal(answer)">
              <i class="mdi mdi-check-decagram-outline mr-1" /> Calificar
            </DuiButton>
            <ConfirmDelete :action="() => remove(answer)" label="" size="sm" />
          </div>
        </div>
        <p class="whitespace-pre-wrap text-sm">{{ answer.answer }}</p>
        <a v-if="answer.attachment" :href="answer.attachment" target="_blank" rel="noopener" class="text-xs text-blue-500 hover:underline">
          <i class="mdi mdi-paperclip" /> Adjunto
        </a>
        <p v-if="answer.feedback" class="rounded-lg bg-slate-500/10 p-2 text-sm text-slate-600 dark:text-slate-300">
          <strong>Feedback:</strong> {{ answer.feedback }}
        </p>
      </li>
    </ul>

    <DuiPagination
      v-if="pagination.total > pagination.perPage"
      :model-value="pagination.page"
      :total="pagination.total"
      :per-page="pagination.perPage"
      size="sm"
      @update:model-value="fetch"
    />

    <DuiModal v-model="showModal" :title="editing ? 'Calificar respuesta' : 'Registrar respuesta'" size="lg">
      <form class="flex flex-col gap-4" @submit.prevent="save">
        <DuiLabel v-if="!editing" title="Estudiante" required help-text="Debe estar inscrito en el curso">
          <UserPicker v-model="user" />
        </DuiLabel>
        <DuiLabel title="Respuesta" required>
          <DuiTextarea v-model="form.answer" block rows="5" required />
        </DuiLabel>
        <DuiLabel title="Adjunto">
          <AttachmentInput v-model="form.attachment" />
        </DuiLabel>
        <div class="grid gap-4 sm:grid-cols-4">
          <DuiLabel title="Nota (0-100)">
            <DuiInput v-model.number="form.result" block type="number" min="0" max="100" />
          </DuiLabel>
          <DuiLabel title="Feedback" class="sm:col-span-3">
            <DuiTextarea v-model="form.feedback" block autoheight placeholder="Comentarios para el estudiante" />
          </DuiLabel>
        </div>
      </form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <DuiButton variant="ghost" @click="showModal = false">Cancelar</DuiButton>
          <DuiButton color="primary" :loading="saving" :disabled="!editing && !user" @click="save">Guardar</DuiButton>
        </div>
      </template>
    </DuiModal>
  </div>
</template>
