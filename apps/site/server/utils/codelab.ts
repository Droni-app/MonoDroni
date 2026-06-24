export interface ChallengeTest {
  id: number
  challenge_id: number
  input: string
  output: string
}

export interface Challenge {
  id: number
  slug: string
  name: string
  description: string
  content: string
  scaffold: string
  funcName: string
  level: number
  tests: ChallengeTest[]
}

export const challenges: Challenge[] = [
  {
    id: 1,
    slug: 'sumar-dos-numeros',
    name: 'Sumar Dos Números',
    description: 'Crea una función que sume dos números y retorne el resultado.',
    content: '## Descripción del desafío\n\nDebes crear una función que tome dos números como parámetros y retorne su suma.\n\n### Requisitos:\n- La función debe aceptar dos parámetros numéricos\n- Debe retornar la suma de ambos números\n- Debes manejar números positivos, negativos y decimales\n\n### Ejemplo:\n```\nsumar(5, 3) => 8\nsumar(-2, 4) => 2\nsumar(1.5, 2.5) => 4\n```',
    scaffold: 'function sumar(a: number, b: number): number {\n  // Tu código aquí\n  return 0;\n}\n',
    funcName: 'sumar',
    level: 1,
    tests: [
      { id: 1, challenge_id: 1, input: '5, 3', output: '8' },
      { id: 2, challenge_id: 1, input: '-2, 4', output: '2' },
      { id: 3, challenge_id: 1, input: '1.5, 2.5', output: '4' },
      { id: 4, challenge_id: 1, input: '0, 0', output: '0' },
    ],
  },
  {
    id: 2,
    slug: 'encontrar-maximo',
    name: 'Encontrar el Máximo',
    description: 'Encuentra el número más grande en un array de números.',
    content: '## Descripción del desafío\n\nDebes crear una función que reciba un array de números y retorne el número más grande.\n\n### Requisitos:\n- La función debe aceptar un array de números\n- Debe retornar el número máximo del array\n- El array tendrá al menos un elemento\n- Debe funcionar con números negativos\n\n### Ejemplo:\n```\nfindMax([3, 1, 4, 1, 5]) => 5\nfindMax([-10, -5, -1, -20]) => -1\nfindMax([42]) => 42\n```',
    scaffold: 'function findMax(numbers: number[]): number {\n  // Tu código aquí\n  return 0;\n}\n',
    funcName: 'findMax',
    level: 1,
    tests: [
      { id: 5, challenge_id: 2, input: '[3, 1, 4, 1, 5]', output: '5' },
      { id: 6, challenge_id: 2, input: '[-10, -5, -1, -20]', output: '-1' },
      { id: 7, challenge_id: 2, input: '[42]', output: '42' },
      { id: 8, challenge_id: 2, input: '[100, 50, 75, 25]', output: '100' },
    ],
  },
  {
    id: 3,
    slug: 'invertir-string',
    name: 'Invertir un String',
    description: 'Invierte el contenido de un string y retorna el resultado.',
    content: '## Descripción del desafío\n\nDebes crear una función que reciba un string y lo retorne completamente invertido (al revés).\n\n### Requisitos:\n- La función debe aceptar un string\n- Debe retornar el string invertido\n- Debe preservar espacios y caracteres especiales\n\n### Ejemplo:\n```\nreverseString(\'hola\') => \'aloh\'\nreverseString(\'hello world\') => \'dlrow olleh\'\nreverseString(\'a\') => \'a\'\n```',
    scaffold: 'function reverseString(str: string): string {\n  // Tu código aquí\n  return \'\';\n}\n',
    funcName: 'reverseString',
    level: 1,
    tests: [
      { id: 9, challenge_id: 3, input: "'hola'", output: "'aloh'" },
      { id: 10, challenge_id: 3, input: "'hello world'", output: "'dlrow olleh'" },
      { id: 11, challenge_id: 3, input: "'a'", output: "'a'" },
      { id: 12, challenge_id: 3, input: "'12345'", output: "'54321'" },
    ],
  },
  {
    id: 4,
    slug: 'contar-vocales',
    name: 'Contar Vocales',
    description: 'Cuenta la cantidad de vocales en un string.',
    content: '## Descripción del desafío\n\nDebes crear una función que cuente cuántas vocales (a, e, i, o, u) hay en un string.\n\n### Requisitos:\n- La función debe aceptar un string\n- Debe retornar el número total de vocales\n- Las vocales deben contarse sin importar mayúsculas o minúsculas\n- Solo contar vocales simples (no diptongos)\n\n### Ejemplo:\n```\ncountVowels(\'hola\') => 2\ncountVowels(\'MUNDO\') => 2\ncountVowels(\'aeiou\') => 5\n```',
    scaffold: 'function countVowels(str: string): number {\n  // Tu código aquí\n  return 0;\n}\n',
    funcName: 'countVowels',
    level: 2,
    tests: [
      { id: 13, challenge_id: 4, input: "'hola'", output: '2' },
      { id: 14, challenge_id: 4, input: "'MUNDO'", output: '2' },
      { id: 15, challenge_id: 4, input: "'aeiou'", output: '5' },
      { id: 16, challenge_id: 4, input: "'bcdfg'", output: '0' },
    ],
  },
  {
    id: 5,
    slug: 'fibonacci',
    name: 'Secuencia de Fibonacci',
    description: 'Calcula el n-ésimo número de la secuencia de Fibonacci.',
    content: '## Descripción del desafío\n\nLa secuencia de Fibonacci es una serie de números donde cada número es la suma de los dos anteriores.\nLa secuencia comienza: 0, 1, 1, 2, 3, 5, 8, 13, ...\n\nDebes crear una función que retorne el n-ésimo número de la secuencia de Fibonacci.\n\n### Requisitos:\n- La función debe aceptar un índice (número entero positivo)\n- Debe retornar el número de Fibonacci en esa posición\n- La posición 0 debe retornar 0\n- La posición 1 debe retornar 1\n\n### Ejemplo:\n```\nfibonacci(0) => 0\nfibonacci(1) => 1\nfibonacci(5) => 5\nfibonacci(10) => 55\n```',
    scaffold: 'function fibonacci(n: number): number {\n  // Tu código aquí\n  return 0;\n}\n',
    funcName: 'fibonacci',
    level: 3,
    tests: [
      { id: 17, challenge_id: 5, input: '0', output: '0' },
      { id: 18, challenge_id: 5, input: '1', output: '1' },
      { id: 19, challenge_id: 5, input: '5', output: '5' },
      { id: 20, challenge_id: 5, input: '10', output: '55' },
    ],
  },
]
