<script setup lang="ts">
import { useRoute } from 'vue-router'
import { DuiAlert } from '@dronico/droni-kit'
import { useFetchItem } from '../../../../../composables/useFetchItem'
import PageHeader from '../../../../../components/ui/PageHeader.vue'
import LearnQuestionForm from '../../../../../components/learn/LearnQuestionForm.vue'
import type { LearnQuestion } from '../../../../../types/AppiService'

const route = useRoute()
const courseId = route.params.courseId as string
const { item: question, error } = useFetchItem<LearnQuestion>(`/admin/learn/courses/${courseId}/questions/${route.params.questionId}`)
</script>

<template>
  <PageHeader title="Editar pregunta" :back="`/learn/courses/${courseId}/questions`" />
  <DuiAlert v-if="error" color="danger">{{ error }}</DuiAlert>
  <LearnQuestionForm v-else-if="question" :course-id="courseId" :question="question" />
  <p v-else class="text-slate-500">Cargando...</p>
</template>
