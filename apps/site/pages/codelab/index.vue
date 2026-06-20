<template>
  <div>
    <UiHero>
      <div class="text-center md:text-start py-6">
        <h1
          class="text-balance text-xl lg:text-4xl text-gray-800 drop-shadow-lg dark:text-gray-50"
        >
          Laboratorio de código y programación
        </h1>
        <h4
          class="text-balance text-sm lg:text-lg text-gray-800 drop-shadow-lg dark:text-gray-50"
        >
          Disfruta de algunas de nuestras herramientas y recursos para el
          desarrollo de software.
        </h4>
      </div>
    </UiHero>
    <div class="container mx-auto py-5">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DuiCard
          :image="imgDesafios"
          title="Desafíos de programación"
          to="/codelab/desafios"
          size="l"
        >
          Mejora tus habilidades de programación y resuelve problemas
          interesantes. Puedes encontrar una variedad de desafíos que te
          ayudarán a practicar y mejorar tus habilidades de codificación.
        </DuiCard>

        <DuiCard
          :image="imgJsonTs"
          title="JSON a TypeScript"
          to="/codelab/json-to-ts"
          size="l"
        >
          Convierte automáticamente estructuras JSON en interfaces TypeScript.
          Una herramienta práctica para generar tipos desde tus datos JSON
          de forma rápida y eficiente.
        </DuiCard>

        <DuiCard
          :image="imgDecodeJwt"
          title="Decodificar JWT"
          to="/codelab/decode-jwt"
          size="l"
        >
          <p>
            Decodifica y visualiza el contenido de un JSON Web Token (JWT).
            Inspecciona el header, payload y signature de forma clara y sencilla.
          </p>
        </DuiCard>

        <DuiCard
          :image="imgBase64"
          title="Base64 Codificar / Decodificar"
          to="/codelab/base64"
          size="l"
        >
          <p>
            Codifica y decodifica texto y archivos en Base64 directamente en tu navegador.
            Sube un archivo para obtener su Base64 o pega un Base64 para descargarlo.
          </p>
        </DuiCard>

        <DuiCard
          :image="imgFormatter"
          title="Formateador de código"
          to="/codelab/formatter"
          size="l"
        >
          <p>
            Formatea y embellece código minificado o mal indentado. Soporta JSON, XML, HTML,
            CSS, SCSS, JavaScript, TypeScript, GraphQL, YAML y Markdown.
          </p>
        </DuiCard>

        <DuiCard
          :image="imgJsonCsv"
          title="Convertidor JSON ↔ CSV"
          to="/codelab/json-csv"
          size="l"
        >
          <p>
            Convierte entre JSON y CSV de forma instantánea. Carga archivos JSON o CSV
            y descarga el resultado en el formato que necesites.
          </p>
        </DuiCard>

        <DuiCard
          title="Utilidades y generadores"
          to="/codelab/mini-converters"
          size="l"
        >
          <div class="flex items-center justify-center h-32 text-violet-500 dark:text-violet-400">
            <i class="mdi mdi-lightning-bolt text-8xl" />
          </div>
          <p>
            URL encoder, case converter, epoch timestamp, unidades CSS,
            generador de contraseñas seguras y UUIDs — todo en una sola página.
          </p>
        </DuiCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DuiCard } from '@dronico/droni-kit'
import imgDesafios from '~/assets/img/pages/desafios-de-programacion.webp'
import imgJsonTs from '~/assets/img/pages/convertir-json-a-typescript.webp'
import imgDecodeJwt from '~/assets/img/pages/decodificarJWT.webp'
import imgBase64 from '~/assets/img/pages/convertidor-base64.webp'
import imgJsonCsv from '~/assets/img/pages/convertidor-json-a-csv.webp'
import imgFormatter from '~/assets/img/pages/formateador-de-codigo.webp'

useSeoMeta({
  title: "Laboratorio de código y programación | Droni.co",
  ogTitle: "Laboratorio de código y programación | Droni.co",
  description: "Disfruta de algunas de nuestras herramientas y recursos para el desarrollo de software.",
  ogDescription: "Disfruta de algunas de nuestras herramientas y recursos para el desarrollo de software.",
  ogImage: "/_nuxt/assets/img/pages/convertir-json-a-typescript.webp",
  twitterImage: "/_nuxt/assets/img/pages/convertir-json-a-typescript.webp",
  twitterCard: "summary_large_image",
});
</script>
