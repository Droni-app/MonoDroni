<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import LearnCourseForm from '../../../components/learn/LearnCourseForm.vue'
import AppiService from '../../../services/AppiService'
import type { LearnCourse, LearnCourseFormData } from '../../../types/AppiService'

const router = useRouter()
const loading = ref(false)
const error = ref<string | null>(null)

async function handleSubmit(data: LearnCourseFormData) {
  loading.value = true
  error.value = null
  try {
    const { data: created } = await AppiService.post<LearnCourse>('/admin/learn/courses', data)
    router.push(`/learn/courses/${created.id}`)
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'Error al crear el curso.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">Nuevo curso</h1>
    <LearnCourseForm :loading="loading" :error="error" @submit="handleSubmit" />
  </div>
</template>
