<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import PostForm from '../../../components/PostForm.vue'
import AppiService from '../../../services/AppiService'
import type { Post, PostFormData } from '../../../types/AppiService'

const router = useRouter()
const loading = ref(false)
const error = ref<string | null>(null)

async function handleSubmit(data: PostFormData) {
  loading.value = true
  error.value = null
  try {
    const { data: created } = await AppiService.post<Post>('/admin/content/posts', {
      ...data,
      active: data.active ? 1 : 0,
      content: data.content || null,
    })
    router.push(`/content/posts/${created.id}`)
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'Error al crear el post.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">Nuevo post</h1>
    <PostForm :loading="loading" :error="error" @submit="handleSubmit" />
  </div>
</template>
