<!-- eslint-disable vue/no-v-html -->
<template>
  <div v-if="challenge" class="md:flex h-screen">
    <section class="md:w-1/2 h-full overflow-auto">
      <UiHero>
        <div class="text-center md:text-start py-6">
          <h1 class="text-balance text-xl lg:text-4xl text-gray-800 drop-shadow-lg dark:text-gray-50">
            {{ challenge.name }}
          </h1>
          <h4 class="text-balance text-sm lg:text-lg text-gray-800 drop-shadow-lg dark:text-gray-50">
            {{ challenge.description }}
          </h4>
        </div>
      </UiHero>
      <div class="container mx-auto px-2 md:px-auto">
        <article
          class="prose lg:prose-lg max-w-full dark:prose-invert md:my-8"
          v-html="markdown.render(String(challenge.content))"
        />
      </div>
    </section>
    <section class="bg-zinc-50 dark:bg-zinc-900 md:w-1/2 flex flex-col h-full">
      <header class="flex items-center justify-between p-2 flex-shrink-0">
        <NuxtLink to="/codelab/desafios/">
          <DuiAction>
            <i class="mdi mdi-arrow-left" />
            Volver
          </DuiAction>
        </NuxtLink>
        <div class="grow" />
        <DuiButton color="secondary" @click="compileCode">
          <i class="mdi mdi-clipboard-text" />
          <i class="mdi mdi-play" />
          Ejecutar
        </DuiButton>
      </header>
      <ClientOnly v-if="challenge.scaffold.length > 0" fallback-tag="div" fallback="Cargando editor...">
        <MonacoEditor v-model="code" lang="typescript" :class="{ 'flex-1': !isResultsPanelOpen, 'h-1/2': isResultsPanelOpen }" :options="{ theme: 'vs-dark' }" />
      </ClientOnly>
      <!-- <textarea
        v-model="code"
        class="w-full h-full border-2 border-slate-500 rounded p-2 shadow-lg mb-1"
        placeholder="Escribe tu código aquí..." /> -->
      <footer :class="{ 'flex-shrink-0 h-auto': !isResultsPanelOpen, 'h-1/2': isResultsPanelOpen, 'overflow-hidden': true }">
        <div class="flex justify-between items-center border border-slate-500 rounded p-2 shadow-lg mb-2">
          <div>
            <h2 class="font-bold">Resultado de los tests</h2>
            <p v-if="consoleTime > 0" class="text-sm">
              <i class="mdi mdi-clock-outline" />
              {{ consoleTime }}ms 
              <i class="mdi mdi-test-tube-empty" />
              {{ consoleResults.length }} tests
            </p>
          </div>
          <button
            class="text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-slate-100 transition cursor-pointer"
            :title="isResultsPanelOpen ? 'Colapsar' : 'Expandir'"
            @click="isResultsPanelOpen = !isResultsPanelOpen"
          >
            <i :class="isResultsPanelOpen ? 'mdi mdi-chevron-down' : 'mdi mdi-chevron-up'" />
          </button>
        </div>
        <div v-if="isResultsPanelOpen" class="overflow-y-auto h-[calc(100%-50px)]">
          <DuiAlert v-for="result in consoleResults" :key="result.test" variant="outline" class="m-2" :color="result.check ? 'success' : 'danger'">
            <strong class="block">Prueba: {{ result.test }}</strong>
            <div v-if="!result.check" class="text-sm">
              <span>Esperado: {{ JSON.stringify(result.esperado) }} | Obtenido: {{ JSON.stringify(result.obtenido) }}</span>
            </div>
          </DuiAlert>
        </div>
      </footer>
    </section>
  </div>
</template>
<script setup lang="ts">
import MarkdownIt from "markdown-it";
import { DuiAction, DuiButton, DuiAlert } from "@dronico/droni-kit";

useHead({
  script: [
    {
      src: "https://cdn.jsdelivr.net/npm/typescript@latest/lib/typescript.js",
      type: "text/javascript",
    }
  ],
})

definePageMeta({
  layout: 'blank'
})

const markdown = new MarkdownIt();
const route = useRoute();
const { data: challenge } = useFetch<Challenge>(() => `/api/codelab/challenges/${route.params.slug}`, {
  watch: [() => route.params.slug],
});

useSeoMeta({
  title: () => challenge.value?.name,
  ogTitle: () => challenge.value?.name,
  description: () => challenge.value?.description,
  ogDescription: () => challenge.value?.description,
  ogType: "article",
  ogImage:
    "https://dronico.nyc3.digitaloceanspaces.com/4ebaccf5-b863-4f12-aa49-9bbe0e1844e2/db7d4d54-7354-4421-9682-d1b75b1f1413/74529-dronico-card.png.png",
  twitterCard: "summary_large_image",
  ogUrl: () => `https://droni.co/codelab/desafios/${challenge.value?.slug}`,
});

const consoleResults = ref<TestResult[]>([]);
const consoleTime = ref(0);
const code = ref('');
const isResultsPanelOpen = ref(false);

watch(challenge, (newChallenge) => {
  if (newChallenge && !code.value) {
    code.value = newChallenge.scaffold || ''
  }
}, { immediate: true })

const compileCode = async () => {
  isResultsPanelOpen.value = true;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const ts = globalThis.ts;
  consoleResults.value = [];
  const codigo = ts.transpileModule(code.value, { compilerOptions: { module: ts.ModuleKind.CommonJS }});
  const inicio = performance.now();
  if (!challenge.value?.tests?.length) {
    return;
  }
  for (const test of challenge.value.tests) {
    let breakProccess = false;
    const codigoTest = `
      ${codigo.outputText}
      return {
        test: '${challenge.value?.funcName}(${test.input})',
        esperado: ${test.output},
        obtenido: ${challenge.value?.funcName}(${test.input}),
        check: (() => {
          const a = ${challenge.value?.funcName}(${test.input});
          const b = ${test.output};
          if(a === b) { return true; }
          if(typeof a !== typeof b) { return false; }
          if(Array.isArray(a) && Array.isArray(b)) {
            if(a.length !== b.length) { return false; }
            for(let i = 0; i < a.length; i++) {
              if(a[i] !== b[i]) { return false; }
            }
            return true;
          }
          return false;
        })()
      }
    `;
    try {
      // Usando Function, para mas seguridad.
      const funcionEjecutable = new Function(codigoTest);
      
      const resultado = await funcionEjecutable();
      if(resultado !== undefined){
        consoleResults.value.push(resultado);
        breakProccess = !resultado.check;
      }
    } catch (error) {
      consoleResults.value.push({test: '', esperado: '', obtenido: String(error), check: false});
      breakProccess = true;
    }
    if(breakProccess) {
      break;
    }
  }
  const fin = performance.now();
  consoleTime.value = fin - inicio;
}
</script>
