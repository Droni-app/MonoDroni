<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { DuiTextarea, DuiCheckbox, DuiButton, DuiLabel, DuiAlert } from '@dronico/droni-kit'
import AppiService from '../../../services/AppiService'
import type { Comment } from '../../../types/AppiService'

const route = useRoute()

const comment = ref<Comment | null>(null)
const fetching = ref(true)
const fetchError = ref<string | null>(null)

const form = reactive({ content: '', active: false })
const saving = ref(false)
const saveError = ref<string | null>(null)
const saveSuccess = ref(false)

async function fetchComment() {
  try {
    const { data } = await AppiService.get<Comment>(`/admin/social/comments/${route.params.id}`)
    comment.value = data
    form.content = data.content
    form.active = data.active
  } catch {
    fetchError.value = 'No se pudo cargar el comentario.'
  } finally {
    fetching.value = false
  }
}

async function handleSubmit() {
  saving.value = true
  saveError.value = null
  saveSuccess.value = false
  try {
    const { data } = await AppiService.patch<Comment>(`/admin/social/comments/${route.params.id}`, {
      content: form.content,
      active: form.active,
    })
    comment.value = { ...comment.value!, ...data }
    saveSuccess.value = true
  } catch (e: any) {
    saveError.value = e?.response?.data?.message ?? 'Error al guardar el comentario.'
  } finally {
    saving.value = false
  }
}

onMounted(() => fetchComment())
</script>

<template>
  <div class="p-6 max-w-3xl">
    <div class="flex items-center gap-3 mb-6">
      <RouterLink to="/social/comments">
        <DuiButton color="neutral" size="sm">
          <i class="mdi mdi-arrow-left" />
        </DuiButton>
      </RouterLink>
      <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Editar Comentario</h1>
    </div>

    <p v-if="fetching" class="text-slate-500 dark:text-slate-400">Cargando...</p>
    <p v-else-if="fetchError" class="text-red-500">{{ fetchError }}</p>

    <template v-else>
      <!-- Parent comment (thread context) -->
      <div
        v-if="comment?.parent"
        class="mb-6 p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
      >
        <p class="text-xs text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wide">Respondiendo a</p>
        <div class="flex gap-3">
          <div class="shrink-0">
            <img
              v-if="comment.parent.user?.avatar"
              :src="comment.parent.user.avatar"
              :alt="comment.parent.user.fullName"
              class="h-7 w-7 rounded-full object-cover"
            />
            <span v-else class="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-semibold uppercase">
              {{ comment.parent.user?.fullName?.charAt(0) ?? '?' }}
            </span>
          </div>
          <div>
            <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">{{ comment.parent.user?.fullName }}</span>
            <p class="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{{ comment.parent.content }}</p>
          </div>
        </div>
      </div>

      <!-- Edit form -->
      <form class="flex flex-col gap-4 mb-10" @submit.prevent="handleSubmit">
        <DuiAlert v-if="saveError" color="danger">{{ saveError }}</DuiAlert>
        <DuiAlert v-if="saveSuccess" color="success">Comentario guardado correctamente.</DuiAlert>

        <div class="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
          <div class="flex items-center gap-2">
            <img
              v-if="comment?.user?.avatar"
              :src="comment.user.avatar"
              :alt="comment.user.fullName"
              class="h-6 w-6 rounded-full object-cover"
            />
            <span v-else class="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-semibold uppercase">
              {{ comment?.user?.fullName?.charAt(0) ?? '?' }}
            </span>
            <span>{{ comment?.user?.fullName }}</span>
          </div>
          <span>·</span>
          <span>{{ comment?.createdAt ? new Date(comment.createdAt).toLocaleDateString() : '' }}</span>
          <span v-if="comment?.isEdited" class="italic">(editado)</span>
          <span
            v-if="comment?.commentableType"
            class="inline-block px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs"
          >
            {{ comment.commentableType }}
          </span>
        </div>

        <DuiLabel title="Contenido">
          <DuiTextarea v-model="form.content" block :autoheight="true" placeholder="Contenido del comentario" />
        </DuiLabel>

        <DuiCheckbox v-model="form.active" label="Activo" color="primary" />

        <div class="flex gap-3 justify-end pt-2">
          <RouterLink to="/social/comments">
            <DuiButton type="button" color="neutral">Cancelar</DuiButton>
          </RouterLink>
          <DuiButton type="submit" color="primary" :disabled="saving">
            {{ saving ? 'Guardando...' : 'Guardar' }}
          </DuiButton>
        </div>
      </form>

      <!-- Children replies -->
      <div v-if="comment?.children && comment.children.length > 0">
        <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
          Respuestas
          <span class="text-sm font-normal text-slate-400 ml-2">({{ comment.children.length }})</span>
        </h2>
        <div class="flex flex-col gap-3">
          <div
            v-for="child in comment.children"
            :key="child.id"
            class="flex gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          >
            <div class="shrink-0">
              <img
                v-if="child.user?.avatar"
                :src="child.user.avatar"
                :alt="child.user.fullName"
                class="h-8 w-8 rounded-full object-cover"
              />
              <span v-else class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-semibold uppercase">
                {{ child.user?.fullName?.charAt(0) ?? '?' }}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-baseline gap-2 mb-1">
                <RouterLink
                  :to="`/social/comments/${child.id}`"
                  class="text-sm font-semibold text-slate-800 dark:text-slate-100 hover:underline"
                >
                  {{ child.user?.fullName }}
                </RouterLink>
                <span class="text-xs text-slate-400">{{ new Date(child.createdAt).toLocaleDateString() }}</span>
              </div>
              <p class="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{{ child.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
