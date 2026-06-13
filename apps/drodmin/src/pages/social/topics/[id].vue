<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { DuiInput, DuiTextarea, DuiCheckbox, DuiButton, DuiLabel, DuiAlert } from '@dronico/droni-kit'
import AppiService from '../../../services/AppiService'
import type { Topic, Reply, PaginatedResponse, PaginationMeta } from '../../../types/AppiService'

const route = useRoute()

const topic = ref<Topic | null>(null)
const fetching = ref(true)
const fetchError = ref<string | null>(null)

const form = reactive({ name: '', content: '', active: false })
const saving = ref(false)
const saveError = ref<string | null>(null)
const saveSuccess = ref(false)

const replies = ref<Reply[]>([])
const repliesMeta = ref<Pick<PaginationMeta, 'total' | 'perPage' | 'currentPage'>>({ total: 0, perPage: 20, currentPage: 1 })
const repliesLoading = ref(false)

async function fetchTopic() {
  try {
    const { data } = await AppiService.get<Topic>(`/admin/social/topics/${route.params.id}`)
    topic.value = data
    form.name = data.name
    form.content = data.content
    form.active = data.active
  } catch {
    fetchError.value = 'No se pudo cargar el topic.'
  } finally {
    fetching.value = false
  }
}

async function fetchReplies(page = 1) {
  repliesLoading.value = true
  try {
    const { data } = await AppiService.get<PaginatedResponse<Reply>>(
      `/admin/social/topics/${route.params.id}/replies`,
      { params: { page, per_page: repliesMeta.value.perPage } }
    )
    replies.value = data.data
    repliesMeta.value = {
      total: data.meta.total,
      perPage: data.meta.perPage,
      currentPage: data.meta.currentPage,
    }
  } finally {
    repliesLoading.value = false
  }
}

async function handleSubmit() {
  saving.value = true
  saveError.value = null
  saveSuccess.value = false
  try {
    const { data } = await AppiService.patch<Topic>(`/admin/social/topics/${route.params.id}`, {
      name: form.name,
      content: form.content,
      active: form.active,
    })
    topic.value = data
    saveSuccess.value = true
  } catch (e: any) {
    saveError.value = e?.response?.data?.message ?? 'Error al guardar el topic.'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await fetchTopic()
  fetchReplies()
})
</script>

<template>
  <div class="p-6 max-w-3xl">
    <div class="flex items-center gap-3 mb-6">
      <RouterLink to="/social/topics">
        <DuiButton color="neutral" size="sm">
          <i class="mdi mdi-arrow-left" />
        </DuiButton>
      </RouterLink>
      <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Editar Topic</h1>
    </div>

    <p v-if="fetching" class="text-slate-500 dark:text-slate-400">Cargando...</p>
    <p v-else-if="fetchError" class="text-red-500">{{ fetchError }}</p>

    <template v-else>
      <form class="flex flex-col gap-4 mb-10" @submit.prevent="handleSubmit">
        <DuiAlert v-if="saveError" color="danger">{{ saveError }}</DuiAlert>
        <DuiAlert v-if="saveSuccess" color="success">Topic guardado correctamente.</DuiAlert>

        <DuiLabel title="Nombre">
          <DuiInput v-model="form.name" block placeholder="Nombre del topic" />
        </DuiLabel>

        <DuiLabel title="Contenido">
          <DuiTextarea v-model="form.content" block :autoheight="true" placeholder="Contenido del topic" />
        </DuiLabel>

        <DuiCheckbox v-model="form.active" label="Activo" color="primary" />

        <div class="flex gap-3 justify-end pt-2">
          <RouterLink to="/social/topics">
            <DuiButton type="button" color="neutral">Cancelar</DuiButton>
          </RouterLink>
          <DuiButton type="submit" color="primary" :disabled="saving">
            {{ saving ? 'Guardando...' : 'Guardar' }}
          </DuiButton>
        </div>
      </form>

      <!-- Replies -->
      <div>
        <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
          Replies
          <span class="text-sm font-normal text-slate-400 ml-2">({{ repliesMeta.total }})</span>
        </h2>

        <p v-if="repliesLoading" class="text-slate-500 dark:text-slate-400 text-sm">Cargando replies...</p>

        <div v-else-if="replies.length === 0" class="text-sm text-slate-400 dark:text-slate-500">
          Sin replies aún.
        </div>

        <div v-else class="flex flex-col gap-3">
          <div
            v-for="reply in replies"
            :key="reply.id"
            class="flex gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          >
            <div class="shrink-0">
              <img
                v-if="reply.user?.avatar"
                :src="reply.user.avatar"
                :alt="reply.user.fullName"
                class="h-8 w-8 rounded-full object-cover"
              />
              <span v-else class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-semibold uppercase">
                {{ reply.user?.fullName?.charAt(0) ?? '?' }}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-baseline gap-2 mb-1">
                <span class="text-sm font-semibold text-slate-800 dark:text-slate-100">{{ reply.user?.fullName }}</span>
                <span class="text-xs text-slate-400">{{ new Date(reply.createdAt).toLocaleDateString() }}</span>
              </div>
              <p class="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{{ reply.content }}</p>
            </div>
          </div>

          <!-- Paginación replies -->
          <div v-if="repliesMeta.total > repliesMeta.perPage" class="flex justify-center gap-2 mt-2">
            <DuiButton
              size="sm"
              color="neutral"
              :disabled="repliesMeta.currentPage <= 1"
              @click="fetchReplies(repliesMeta.currentPage - 1)"
            >
              <i class="mdi mdi-chevron-left" />
            </DuiButton>
            <span class="text-sm text-slate-600 dark:text-slate-400 flex items-center px-2">
              {{ repliesMeta.currentPage }} / {{ Math.ceil(repliesMeta.total / repliesMeta.perPage) }}
            </span>
            <DuiButton
              size="sm"
              color="neutral"
              :disabled="repliesMeta.currentPage >= Math.ceil(repliesMeta.total / repliesMeta.perPage)"
              @click="fetchReplies(repliesMeta.currentPage + 1)"
            >
              <i class="mdi mdi-chevron-right" />
            </DuiButton>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
