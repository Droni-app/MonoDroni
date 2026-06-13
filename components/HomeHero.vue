<template>
  <section class="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-300 to-white dark:from-gray-900 dark:to-black text-gray-900 dark:text-white overflow-hidden">
    <!-- Código animado al fondo -->
    <div class="absolute inset-0 z-0 px-4 pt-20 opacity-40 dark:opacity-30 select-none">
      <pre class="text-green-700 dark:text-green-400 text-sm whitespace-pre-wrap font-mono container mx-auto">
        {{ typedCode }}
      </pre>
    </div>

    <!-- Contenido principal -->
     <div class="container mx-auto">
      <div class="relative z-2 text-center max-w-4xl px-6 mx-auto">
        <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
          <span class="bg-gradient-to-r from-blue-500 to-purple-600 dark:from-cyan-400 dark:to-purple-600 text-transparent bg-clip-text">
            Transformamos ideas en soluciones digitales innovadoras
          </span>
        </h1>
        <p class="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6">
          Somos el Wozniak de tu Jobs, somos la malta de tu pastelito, somos el Spock de tu Kirk, somos el Doc Brown de tu Mcfly -creo que ya lo entendiste.
        </p>
        <UiAction 
          to="https://discord.com/channels/1255198066080874527/1255198066080874529"
          title="Unete a nosotros en discord">
          <i class="mdi mdi-rocket-launch-outline me-3" />
          Únete al club
        </UiAction>
        
      </div>
      <div class="relative z-2 grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <BlogCardH v-for="post in lastPosts?.data" :key="post.id" :post="post" class="mt-8 md:mx-4" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const lastPosts = useFetch<Pagination<Post[]>>(`/api/appi/content/posts?perPage=2&category=blog`).data
const fullCode = `
function startInnovation() {
  const tech = ['AI', 'Web3', 'Vue.js', 'Tailwind'];
  tech.forEach(stack => {
    console.log(\`Exploring \${stack}...\`);
  });
  return '🚀 Let\\'s Code the Future!';
}

startInnovation();`;

const typedCode = ref('');
let index = 0;

onMounted(() => {
  const typeLoop = () => {
    const interval = setInterval(() => {
      if (index < fullCode.length) {
        typedCode.value += fullCode[index];
        index++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          typedCode.value = '';
          index = 0;
          typeLoop(); // reiniciar la animación
        }, 1500); // pausa antes de volver a empezar
      }
    }, 30);
  };

  typeLoop(); // iniciar typing por primera vez
});
</script>
