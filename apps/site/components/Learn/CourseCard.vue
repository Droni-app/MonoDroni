<template>
  <DuiCard
    v-if="props.course"
    :image="props.course.picture ?? ''"
    :title="props.course.name"
    :subtitle="props.course.description ?? ''"
    :to="`/cursos/${props.course.slug}`"
    size="l"
  >
    <div class="flex flex-wrap items-center gap-2 mt-1">
      <DuiBadge v-if="props.course.group" :label="props.course.group" color="secondary" variant="soft" size="sm" />
      <DuiBadge v-if="props.course.autoEnroll" label="Inscripción abierta" color="success" variant="soft" size="sm" />
    </div>
  </DuiCard>
</template>
<script setup lang="ts">
import { DuiCard, DuiBadge } from '@dronico/droni-kit'
const props = defineProps<{
  course: LearnCourse
}>()
</script>
