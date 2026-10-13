<script setup lang="ts">
import { useRoute } from 'vue-router'
import { DuiAlert, DuiButton } from '@dronico/droni-kit'
import { useFetchItem } from '../../../composables/useFetchItem'
import PageHeader from '../../../components/ui/PageHeader.vue'
import LearnCourseForm from '../../../components/learn/LearnCourseForm.vue'
import type { LearnCourse } from '../../../types/AppiService'

const route = useRoute()
const id = route.params.id as string
const { item: course, error } = useFetchItem<LearnCourse>(`/admin/learn/courses/${id}`)
</script>

<template>
  <PageHeader :title="course?.name ?? 'Editar curso'" :subtitle="course?.slug" back="/learn/courses">
    <DuiButton variant="outline" :to="`/learn/courses/${id}/lessons`">
      <i class="mdi mdi-book-open-page-variant-outline mr-1" /> Lecciones
    </DuiButton>
    <DuiButton variant="outline" :to="`/learn/courses/${id}/questions`">
      <i class="mdi mdi-help-circle-outline mr-1" /> Banco de preguntas
    </DuiButton>
    <DuiButton variant="outline" :to="{ path: '/learn/enrollments', query: { course_id: id } }">
      <i class="mdi mdi-account-school-outline mr-1" /> Inscritos
    </DuiButton>
  </PageHeader>
  <DuiAlert v-if="error" color="danger">{{ error }}</DuiAlert>
  <LearnCourseForm v-else-if="course" :course="course" />
  <p v-else class="text-slate-500">Cargando...</p>
</template>
