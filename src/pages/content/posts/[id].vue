<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { DuiButton, DuiModal } from '@dronico/droni-kit'
import PostForm from '../../../components/PostForm.vue'
import AppiService from '../../../services/AppiService'
import type { Post, PostFormData } from '../../../types/AppiService'

const route = useRoute()
const router = useRouter()

const post = ref<Post | null>(null)
const loading = ref(false)
const fetching = ref(true)
const error = ref<string | null>(null)
const showDeleteModal = ref(false)
const deleting = ref(false)

async function handleDelete() {
  deleting.value = true
  try {
    await AppiService.delete(`/admin/content/posts/${route.params.id}`)
    router.push('/content/posts')
  } catch {
    error.value = 'Error al eliminar el post.'
    showDeleteModal.value = false
  } finally {
    deleting.value = false
  }
}

onMounted(async () => {
  try {
    const { data } = await AppiService.get<Post>(`/admin/content/posts/${route.params.id}`)
    post.value = data
  } catch {
    error.value = 'No se pudo cargar el post.'
  } finally {
    fetching.value = false
  }
})

async function handleSubmit(data: PostFormData) {
  loading.value = true
  error.value = null
  try {
    await AppiService.patch(`/admin/content/posts/${route.params.id}`, {
      ...data,
      active: data.active,
      content: data.content || null,
    })
    router.push('/content/posts')
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'Error al actualizar el post.'
  } finally {
    loading.value = false
  }
}

function toFormData(p: Post): PostFormData {
  return {
    name: p.name,
    description: p.description,
    tags: [...p.tags],
    picture: p.picture,
    content: p.content,
    format: p.format,
    active: p.active,
  }
}
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">Editar post</h1>

    <p v-if="fetching" class="text-slate-500 dark:text-slate-400">Cargando...</p>

    <PostForm
      v-else-if="post"
      :initial-value="toFormData(post)"
      :loading="loading"
      :error="error"
      :post-id="post.id"
      deletable
      @submit="handleSubmit"
      @delete="showDeleteModal = true"
    />

    <p v-else class="text-red-500">{{ error }}</p>

    <DuiModal v-model="showDeleteModal">
      <template #header>Eliminar post</template>
      <p class="text-slate-600 dark:text-slate-300">
        ¿Estás seguro de que deseas eliminar este post? Esta acción no se puede deshacer.
      </p>
      <template #footer>
        <div class="flex justify-end gap-3">
          <DuiButton color="neutral" @click="showDeleteModal = false">Cancelar</DuiButton>
          <DuiButton color="danger" :disabled="deleting" @click="handleDelete">
            {{ deleting ? 'Eliminando...' : 'Eliminar' }}
          </DuiButton>
        </div>
      </template>
    </DuiModal>
  </div>
</template>
