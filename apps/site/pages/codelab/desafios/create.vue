<template>
  <div>
    <UiHero>
      <div class="text-center md:text-start py-6">
        <h1 class="text-balance text-xl lg:text-4xl text-gray-800 drop-shadow-lg dark:text-gray-50">
          Desafios de programación
        </h1>
        <h4 class="text-balance text-sm lg:text-lg text-gray-800 drop-shadow-lg dark:text-gray-50">
          Crea y comparte tus propios desafíos de programación. Puedes encontrar una variedad de desafíos que te ayudarán a practicar y mejorar tus habilidades de codificación.
        </h4>
      </div>
    </UiHero>
    <div class="container mx-auto py-5 px-3 md:px-0">
      <form action="#" @submit.prevent="saveChallenge">
        <div class="md:flex w-full">
          <div class="w-full md:w-1/2 md:p-4">
            <DuiInput
              v-model="newChallenge.name"
              name="name"
              label="Nombre del desafío"
              placeholder="ej. Suma de dos números"
              required
              block
              class="mb-3" />
            <DuiTextarea
              v-model="newChallenge.description"
              label="Descripción del desafío"
              placeholder="ej. Crea una función que sume dos números y devuelva el resultado."
              required
              block
              class="mb-3" />
            <DuiInput
              v-model="newChallenge.funcName"
              label="Nombre de la función"
              placeholder="ej. sumaDos"
              required
              block
              class="mb-3" />
            <DuiSelect
              v-model="newChallenge.level"
              label="Dificultad"
              :options="[
                { value: '1', label: 'Fácil' },
                { value: '2', label: 'Intermedio' },
                { value: '3', label: 'Difícil' }
              ]"
              placeholder="Selecciona un nivel de dificultad"
              required
              block
              class="mb-3" />
            <h4 class="font-bold text-gray-800 drop-shadow-lg dark:text-gray-200 pt-4">
              Definición del desafío
            </h4>
            <p class="text-sm text-gray-700 dark:text-gray-400 pb-3">
              Detalla los parámetros de entrada y salida de tu desafío, así como ejemplos de uso. Puedes usar Markdown para formatear el texto.
            </p>
            <DuiTextarea
              v-model="newChallenge.content"
              label="Detalles del desafío"
              placeholder="ej. Descripción de los parámetros de entrada y salida, ejemplos de uso."
              required
              block
              class="mb-3" />
          </div>
          <div class="w-full md:w-1/2 md:p-4">
            <h4 class="font-bold text-gray-800 drop-shadow-lg dark:text-gray-200 pt-4">
              Casos de prueba
            </h4>
            <p class="text-sm text-gray-700 dark:text-gray-400 pb-3">
              Agrega casos de prueba para tu desafío. Cada caso de prueba debe tener una entrada y una salida.
              <span class="block text-rose-500">
                Debes incluir al menos 5 casos de prueba para guardar el desafío.
              </span>
            </p>
            <div class="flex">
              <div class="w-2/4">
                <DuiInput
                  v-model="newTest.input"
                  placeholder="Entrada: ej. 1, 2"
                  block
                  class="mb-3" />
              </div>
              <div class="w-2/4">
                <DuiInput
                  v-model="newTest.output"
                  placeholder="Salida: ej. 3"
                  block
                  class="mb-3" />
              </div>
              <div class="w-1/5">
                <DuiButton
                  block
                  variant="outline"
                  type="button"
                  @click.prevent="addTest">
                  <i class="mdi mdi-plus" />
                </DuiButton>
              </div>
            </div>
            <div v-for="(test, index) in newChallenge.tests" :key="test.id" class="flex gap-2 items-center border border-slate-500 rounded p-2 shadow-lg mb-1">
              <div class="grow">
                <p class="text-sm">
                  <code>Datos de entrada: {{ test.input }}</code><br>
                  <code>Salida esperada: {{ test.output }}</code>
                </p>
              </div>
              <DuiButton variant="ghost" color="danger" size="sm" @click="removeTest(index)">
                <i class="mdi mdi-delete" />
              </DuiButton>
            </div>
            <ClientOnly v-if="newChallenge.scaffold.length > 0" fallback-tag="div" fallback="Cargando editor...">
              <MonacoEditor v-model="newChallenge.scaffold" lang="typescript" tab-size="4" />
            </ClientOnly>
          </div>
        </div>
        <div class="w-full text-center">
          <DuiButton
            variant="solid"
            color="secondary"
            type="submit">
            <i class="mdi mdi-content-save" />
            Guardar desafío
          </DuiButton>
        </div>
      </form>
    </div>
  </div>
</template>
<script setup lang="ts">
import { DuiButton, DuiInput, DuiTextarea, DuiSelect } from '@dronico/droni-kit';

definePageMeta({
  middleware: 'sidebase-auth'
})

const newChallenge = ref({
  name: '',
  description: '',
  content: '',
  level: '3',
  funcName: '',
  scaffold: '',
  tests: [] as Test[],
});

const newTest = ref<Test>({
  id: 0,
  challenge_id: 0,
  input: '',
  output: '',
});

const addTest = () => {
  if(!newChallenge.value.tests) return;
  newTest.value.output = JSON.stringify(separarValores(newTest.value.output)[0])
  newTest.value.input = separarValores(newTest.value.input).map((input: unknown) => JSON.stringify(input)).join(', ')
  if(newTest.value.input.length > 0 && newTest.value.output.length > 0) {
    newChallenge.value.tests.push(newTest.value)
    scaffold()
  }
  newTest.value = {
    id: 0,
    challenge_id: 0,
    input: '',
    output: ''
  }
}
const removeTest = (index: number) => {
  newChallenge.value.tests.splice(index, 1);
};

const scaffold = () => {
  const usedTest = (newChallenge.value.tests ?? [])[((newChallenge.value.tests ?? []).length - 1)] ?? null
  let inputs = ''
  let outputType = ''
  if(usedTest) {
    separarValores(usedTest.input).forEach((input, index) => {
      inputs += `param${index + 1}: ${typeof(input)}, `
      outputType = `: ${typeof separarValores(usedTest.output)[0]}`
    })
  }
  newChallenge.value.scaffold = `// Scaffold funcction, start here!
function ${newChallenge.value.funcName}(${inputs.slice(0, -2)})${outputType} {
  /* Make your magic here */
  return ${responseByType(outputType)};
}
`
}

const separarValores = (str:string): unknown[] =>{
  try {
    const parseStr = '{ "data": [' + str.replaceAll("'", '"' ) + ']}'
    return JSON.parse(parseStr).data;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return [str]
  }
}

const responseByType = (type: string): string => {
  switch (type) {
    case ': number':
      return '0'
    case ': string':
      return "''"
    case ': boolean':
      return 'false'
    default:
      return 'null'
  }
}

const saveChallenge = async () => {
  $fetch(`/api/appi/codevs/challenges`, {
    method: 'POST',
    body: newChallenge.value,
  }).then((challenge) => {
    console.log(challenge)
  }).catch((error) => {
    console.error(error)
  })
  console.log('saveChallenge', newChallenge.value)
}

</script>