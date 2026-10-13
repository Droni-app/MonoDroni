<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { DuiCard, DuiForm, DuiInput, DuiTextarea, DuiSwitch, DuiButton, DuiLabel, DuiAlert, DuiPagination, useToast } from '@dronico/droni-kit'
import AppiService, { apiError } from '../../../services/AppiService'
import { useFetchItem } from '../../../composables/useFetchItem'
import { usePaginatedList } from '../../../composables/usePaginatedList'
import { formatDateTime } from '../../../utils/format'
import PageHeader from '../../../components/ui/PageHeader.vue'
import UserAvatar from '../../../components/ui/UserAvatar.vue'
import type { Topic, Reply } from '../../../types/AppiService'

const route = useRoute()
const toast = useToast()
const url = `/admin/social/topics/${route.params.id}`
const { item: topic, error } = useFetchItem<Topic>(url)
const replies = usePaginatedList<Reply>(`${url}/replies`)

const form = reactive({ name: '', content: '', active: false })
const saving = ref(false)

watch(topic, (t) => {
  if (t) Object.assign(form, { name: t.name, content: t.content, active: !!t.active })
})

async function save() {
  saving.value = true
  try {
    const { data } = await AppiService.patch<Topic>(url, form)
    topic.value = { ...topic.value!, ...data }
    toast.success('Tema guardado.')
  } catch (e) {
    toast.error(apiError(e, 'Error al guardar el tema.'))
  } finally {
    saving.value = false
  }
}

onMounted(() => replies.fetch())
</script>

<template>
  <PageHeader :title="topic?.name ?? 'Tema'" :subtitle="topic?.slug" back="/social/topics" />

  <DuiAlert v-if="error" color="danger">{{ error }}</DuiAlert>
  <p v-else-if="!topic" class="text-slate-500">Cargando...</p>

  <div v-else class="grid items-start gap-6 lg:grid-cols-3">
    <DuiCard :title="`Respuestas (${replies.pagination.value.total})`" class="lg:col-span-2">
      <p v-if="!replies.rows.value.length" class="text-sm text-slate-400">
        {{ replies.loading.value ? 'Cargando...' : 'Sin respuestas.' }}
      </p>
      <ul class="divide-y divide-slate-200 dark:divide-slate-700">
        <li v-for="reply in replies.rows.value" :key="reply.id" class="py-3">
          <div class="flex items-center gap-2">
            <UserAvatar :user="reply.user" />
            <span class="text-xs text-slate-400">{{ formatDateTime(reply.createdAt) }}</span>
          </div>
          <p class="mt-1 whitespace-pre-wrap text-sm">{{ reply.content }}</p>
        </li>
      </ul>
      <DuiPagination
        v-if="replies.pagination.value.total > replies.pagination.value.perPage"
        class="mt-4"
        :model-value="replies.pagination.value.page"
        :total="replies.pagination.value.total"
        :per-page="replies.pagination.value.perPage"
        size="sm"
        @update:model-value="replies.fetch"
      />
    </DuiCard>

    <DuiCard>
      <DuiForm :loading="saving" @submit="save">
        <div class="flex items-center gap-2 text-sm text-slate-500">
          <UserAvatar :user="topic.user" />
          <span class="text-xs">· {{ formatDateTime(topic.createdAt) }}</span>
        </div>
        <DuiLabel title="Nombre" required>
          <DuiInput v-model="form.name" block required minlength="3" />
        </DuiLabel>
        <DuiLabel title="Contenido" required>
          <DuiTextarea v-model="form.content" block autoheight required />
        </DuiLabel>
        <DuiSwitch v-model="form.active" label="Visible en el sitio" color="success" />
        <template #footer>
          <DuiButton type="submit" color="primary" class="ml-auto" :loading="saving">
            <i class="mdi mdi-content-save-outline mr-1" /> Guardar
          </DuiButton>
        </template>
      </DuiForm>
    </DuiCard>
  </div>
</template>
