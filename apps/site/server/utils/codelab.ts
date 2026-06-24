export interface ChallengeTest {
  input: string
  output: string
}

export interface Challenge {
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
    slug: 'sumar-dos-numeros',
    name: 'Sumar Dos Números',
    description: 'Crea una función que sume dos números y retorne el resultado.',
    content: '## Descripción del desafío\n\nDebes crear una función que tome dos números como parámetros y retorne su suma.\n\n### Requisitos:\n- La función debe aceptar dos parámetros numéricos\n- Debe retornar la suma de ambos números\n- Debes manejar números positivos, negativos y decimales\n\n### Ejemplo:\n```\nsumar(5, 3) => 8\nsumar(-2, 4) => 2\nsumar(1.5, 2.5) => 4\n```',
    scaffold: 'function sumar(a: number, b: number): number {\n  // Tu código aquí\n  return 0;\n}\n',
    funcName: 'sumar',
    level: 1,
    tests: [
      { input: '5, 3', output: '8' },
      { input: '-2, 4', output: '2' },
      { input: '1.5, 2.5', output: '4' },
      { input: '0, 0', output: '0' },
    ],
  },
  {
    slug: 'encontrar-maximo',
    name: 'Encontrar el Máximo',
    description: 'Encuentra el número más grande en un array de números.',
    content: '## Descripción del desafío\n\nDebes crear una función que reciba un array de números y retorne el número más grande.\n\n### Requisitos:\n- La función debe aceptar un array de números\n- Debe retornar el número máximo del array\n- El array tendrá al menos un elemento\n- Debe funcionar con números negativos\n\n### Ejemplo:\n```\nfindMax([3, 1, 4, 1, 5]) => 5\nfindMax([-10, -5, -1, -20]) => -1\nfindMax([42]) => 42\n```',
    scaffold: 'function findMax(numbers: number[]): number {\n  // Tu código aquí\n  return 0;\n}\n',
    funcName: 'findMax',
    level: 1,
    tests: [
      { input: '[3, 1, 4, 1, 5]', output: '5' },
      { input: '[-10, -5, -1, -20]', output: '-1' },
      { input: '[42]', output: '42' },
      { input: '[100, 50, 75, 25]', output: '100' },
    ],
  },
  {
    slug: 'invertir-string',
    name: 'Invertir un String',
    description: 'Invierte el contenido de un string y retorna el resultado.',
    content: '## Descripción del desafío\n\nDebes crear una función que reciba un string y lo retorne completamente invertido (al revés).\n\n### Requisitos:\n- La función debe aceptar un string\n- Debe retornar el string invertido\n- Debe preservar espacios y caracteres especiales\n\n### Ejemplo:\n```\nreverseString(\'hola\') => \'aloh\'\nreverseString(\'hello world\') => \'dlrow olleh\'\nreverseString(\'a\') => \'a\'\n```',
    scaffold: 'function reverseString(str: string): string {\n  // Tu código aquí\n  return \'\';\n}\n',
    funcName: 'reverseString',
    level: 1,
    tests: [
      { input: "'hola'", output: "'aloh'" },
      { input: "'hello world'", output: "'dlrow olleh'" },
      { input: "'a'", output: "'a'" },
      { input: "'12345'", output: "'54321'" },
    ],
  },
  {
    slug: 'contar-vocales',
    name: 'Contar Vocales',
    description: 'Cuenta la cantidad de vocales en un string.',
    content: '## Descripción del desafío\n\nDebes crear una función que cuente cuántas vocales (a, e, i, o, u) hay en un string.\n\n### Requisitos:\n- La función debe aceptar un string\n- Debe retornar el número total de vocales\n- Las vocales deben contarse sin importar mayúsculas o minúsculas\n- Solo contar vocales simples (no diptongos)\n\n### Ejemplo:\n```\ncountVowels(\'hola\') => 2\ncountVowels(\'MUNDO\') => 2\ncountVowels(\'aeiou\') => 5\n```',
    scaffold: 'function countVowels(str: string): number {\n  // Tu código aquí\n  return 0;\n}\n',
    funcName: 'countVowels',
    level: 2,
    tests: [
      { input: "'hola'", output: '2' },
      { input: "'MUNDO'", output: '2' },
      { input: "'aeiou'", output: '5' },
      { input: "'bcdfg'", output: '0' },
    ],
  },
  {
    slug: 'fibonacci',
    name: 'Secuencia de Fibonacci',
    description: 'Calcula el n-ésimo número de la secuencia de Fibonacci.',
    content: '## Descripción del desafío\n\nLa secuencia de Fibonacci es una serie de números donde cada número es la suma de los dos anteriores.\nLa secuencia comienza: 0, 1, 1, 2, 3, 5, 8, 13, ...\n\nDebes crear una función que retorne el n-ésimo número de la secuencia de Fibonacci.\n\n### Requisitos:\n- La función debe aceptar un índice (número entero positivo)\n- Debe retornar el número de Fibonacci en esa posición\n- La posición 0 debe retornar 0\n- La posición 1 debe retornar 1\n\n### Ejemplo:\n```\nfibonacci(0) => 0\nfibonacci(1) => 1\nfibonacci(5) => 5\nfibonacci(10) => 55\n```',
    scaffold: 'function fibonacci(n: number): number {\n  // Tu código aquí\n  return 0;\n}\n',
    funcName: 'fibonacci',
    level: 3,
    tests: [
      { input: '0', output: '0' },
      { input: '1', output: '1' },
      { input: '5', output: '5' },
      { input: '10', output: '55' },
      { input: '15', output: '610' },
      { input: '20', output: '6765' },
    ],
  },
  {
    slug: 'tablero-piezas',
    name: 'Tablero de Piezas',
    description: 'Construye un tablero de 8×7 ubicando 7 piezas sin que compartan fila ni columna.',
    content: '## Descripción del desafío\n\nImplementa una función que construya un tablero de **8 filas × 7 columnas** y ubique exactamente **7 piezas**, respetando las siguientes reglas:\n\n- Cada **columna** tiene exactamente una pieza.\n- Ninguna **fila** puede contener más de una pieza (una fila quedará siempre vacía).\n- Las piezas se representan con `1` y los espacios vacíos con `0`.\n\n### Parámetro\n\nLa función recibe `posiciones`: un array de **7 enteros** en el rango `0–7`, donde `posiciones[col]` indica la **fila** en que se coloca la pieza de la columna `col`.\n\n> Se garantiza que todos los valores de `posiciones` son distintos entre sí (no se repite ninguna fila).\n\n### Retorno\n\nUn array bidimensional `number[][]` de **8 filas × 7 columnas**, donde `tablero[fila][col]` es `1` si hay pieza y `0` si el espacio está vacío.\n\n### Ejemplo\n\n```ts\ngenerarTablero([0, 1, 2, 3, 4, 5, 6])\n```\n\nResultado (diagonal principal):\n\n```\n//  col: 0  1  2  3  4  5  6\n[ [1, 0, 0, 0, 0, 0, 0],  // fila 0\n  [0, 1, 0, 0, 0, 0, 0],  // fila 1\n  [0, 0, 1, 0, 0, 0, 0],  // fila 2\n  [0, 0, 0, 1, 0, 0, 0],  // fila 3\n  [0, 0, 0, 0, 1, 0, 0],  // fila 4\n  [0, 0, 0, 0, 0, 1, 0],  // fila 5\n  [0, 0, 0, 0, 0, 0, 1],  // fila 6\n  [0, 0, 0, 0, 0, 0, 0] ] // fila 7 (vacía)\n```\n\n### Restricciones\n\n- El tablero siempre tiene exactamente **8 filas y 7 columnas**.\n- Se ubican exactamente **7 piezas**, una por columna.\n- Como hay 7 piezas y 8 filas, exactamente **una fila quedará siempre vacía**.\n- Cada fila puede contener **a lo sumo una pieza**.\n\n### Reto adicional\n\nUna vez que tu función base funciona, implementa `generarTableroAleatorio(): number[][]` que genere posiciones válidas de forma aleatoria sin repetir filas, usando `generarTablero` internamente.\n\n**Pista:** Mezcla el array `[0,1,2,3,4,5,6,7]` con Fisher-Yates, elimina un elemento al azar (la fila que quedará vacía) y usa los 7 restantes como posiciones.',
    scaffold: 'function generarTablero(posiciones: number[]): number[][] {\n  // posiciones[col] indica la fila donde va la pieza de esa columna\n  // El tablero tiene 8 filas y 7 columnas\n  // board[fila][col] = 1 si hay pieza, 0 si no\n  return [];\n}\n',
    funcName: 'generarTablero',
    level: 1,
    tests: [
      {
        input: '[0,1,2,3,4,5,6]',
        output: '[[1,0,0,0,0,0,0],[0,1,0,0,0,0,0],[0,0,1,0,0,0,0],[0,0,0,1,0,0,0],[0,0,0,0,1,0,0],[0,0,0,0,0,1,0],[0,0,0,0,0,0,1],[0,0,0,0,0,0,0]]',
      },
      {
        input: '[7,6,5,4,3,2,1]',
        output: '[[0,0,0,0,0,0,0],[0,0,0,0,0,0,1],[0,0,0,0,0,1,0],[0,0,0,0,1,0,0],[0,0,0,1,0,0,0],[0,0,1,0,0,0,0],[0,1,0,0,0,0,0],[1,0,0,0,0,0,0]]',
      },
      {
        input: '[2,5,0,7,1,6,3]',
        output: '[[0,0,1,0,0,0,0],[0,0,0,0,1,0,0],[1,0,0,0,0,0,0],[0,0,0,0,0,0,1],[0,0,0,0,0,0,0],[0,1,0,0,0,0,0],[0,0,0,0,0,1,0],[0,0,0,1,0,0,0]]',
      },
      {
        input: '[4,0,6,2,7,3,5]',
        output: '[[0,1,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,1,0,0,0],[0,0,0,0,0,1,0],[1,0,0,0,0,0,0],[0,0,0,0,0,0,1],[0,0,1,0,0,0,0],[0,0,0,0,1,0,0]]',
      },
    ],
  },
  {
    slug: "suma-de-dos-numeros-VrW6",
    name: "Suma de dos números",
    description: "Dada una matriz de números enteros y un objetivo entero, devuelve los índices de los dos números tales que sumen el objetivo.",
    content: "Dado un array de enteros nums y un entero objetivo, devuelve los índices de los dos números de forma que sumen el objetivo. Puedes asumir que cada entrada tendrá exactamente una solución y no puedes usar el mismo elemento dos veces. La respuesta debe retornar los indices ordenados de menor a mayor.\n\n### Ejemplo 1:\nEntrada: nums = [2,7,11,15], objetivo = 9 Salida: [0,1]\nExplicación: Como nums[0] + nums[1] = 9, devolvemos [0, 1].\n\n### Ejemplo 2:\nEntrada: nums = [3,2,4], objetivo = 6 Salida: [1,2]\n\n### Ejemplo 3:\nEntrada: nums = [3,3], objetivo = 6 Salida: [0,1]\n\n## Restricciones:\n2 <= nums.length <= 104 -109 <= nums[i] <= 109 -109 <= objetivo <= 109\n\nSolo existe una respuesta válida.",
    scaffold: "// Scaffold funcction, start here!\nfunction sumaDos(nums: number[], target: number): number[] {\n  /* Make your magic here */\n  return [];\n}",
    funcName: "sumaDos",
    level: 2,
    tests: [
      {
        input: "[2,7,11,15], 9",
        output: "[0,1]"
      },
      {
        input: "[3,2,4], 6",
        output: "[1,2]"
      },
      {
        input: "[3,3], 6",
        output: "[0,1]"
      },
      {
        input: "[12,4,-8,30,16], 28",
        output: "[0,4]"
      },
      {
        input: "[999999,1,-1000000,2], 3",
        output: "[1,3]"
      },
    ],
}
]
