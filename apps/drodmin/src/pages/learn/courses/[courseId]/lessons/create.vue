<script setup lang="ts">
import { useRoute } from 'vue-router'
import PageHeader from '../../../../../components/ui/PageHeader.vue'
import LearnLessonForm from '../../../../../components/learn/LearnLessonForm.vue'

const courseId = useRoute().params.courseId as string
</script>

<template>
  <PageHeader title="Nueva lección" :back="`/learn/courses/${courseId}/lessons`" />
  <LearnLessonForm :course-id="courseId" />
</template>
