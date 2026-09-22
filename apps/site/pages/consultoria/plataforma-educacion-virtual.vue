<template>
  <main class="service-page bg-[#f4f1eb] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    <ConsultoriaServiceHero title="Plataforma de educación virtual" :image="serviceImage" description="Estudiante aprendiendo en una plataforma virtual" />
    <ConsultoriaServiceIntro lead="Una experiencia de aprendizaje que lleva tu metodología más lejos." description="Creamos plataformas educativas para cursos, academias y organizaciones que quieren enseñar con su propia identidad. Facilitamos la creación de contenidos, el seguimiento de estudiantes y la medición del progreso desde un solo lugar." :benefits="benefits" />
    <ConsultoriaServiceIncludes :items="includes" />
    <ConsultoriaServiceCta />
  </main>
</template>

<script setup lang="ts">
const benefits = [
  { title: 'Aprendizaje acompañado', text: 'Lecciones, actividades y progreso visibles para que cada estudiante sepa dónde está.', icon: 'mdi mdi-school-outline' },
  { title: 'Contenido bajo control', text: 'Administra tu catálogo, usuarios y rutas de aprendizaje con autonomía.', icon: 'mdi mdi-book-open-page-variant-outline' },
]
const includes = ['Aulas y rutas de aprendizaje', 'Multimedia y documentos', 'Evaluaciones y certificados', 'Roles de estudiantes y docentes', 'Seguimiento de progreso', 'Panel de administración']
import serviceImage from '~/assets/img/pages/consultoria/plataformas-de-educacion-virtual.webp'
useSeoMeta({ title: 'Plataforma de educación virtual | Droni.co', description: 'Plataformas educativas para crear contenidos, acompañar estudiantes y medir progreso.' })
</script>