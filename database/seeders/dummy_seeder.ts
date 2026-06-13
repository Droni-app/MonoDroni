import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'
import string from '@adonisjs/core/helpers/string'

const SITE_ID = '4ebaccf5-b863-4f12-aa49-9bbe0e1844e2'
const USER_ID = '3dc1c079-f3b4-425b-9d35-46497ca0b74e'

const posts = [
  { name: 'Introducción a AdonisJS 7', description: 'Una guía completa para empezar con AdonisJS 7 y sus nuevas características.', tags: ['adonisjs', 'nodejs', 'backend'], format: 'markdown', content: '# Introducción a AdonisJS 7\n\nAdonisJS 7 trae muchas mejoras importantes...', active: true },
  { name: 'Vue 3 Composition API', description: 'Aprende a usar la Composition API de Vue 3 para escribir código más limpio.', tags: ['vue', 'frontend', 'javascript'], format: 'markdown', content: '# Vue 3 Composition API\n\nLa Composition API es una de las grandes novedades de Vue 3...', active: true },
  { name: 'Docker para desarrolladores', description: 'Cómo usar Docker en tu flujo de trabajo de desarrollo diario.', tags: ['docker', 'devops'], format: 'markdown', content: '# Docker para desarrolladores\n\nDocker simplifica enormemente el desarrollo...', active: true },
  { name: 'TypeScript: Tipos avanzados', description: 'Explorando los tipos genéricos, condicionales y utilitarios de TypeScript.', tags: ['typescript', 'javascript'], format: 'markdown', content: '# TypeScript: Tipos avanzados\n\nTypeScript ofrece un sistema de tipos muy poderoso...', active: true },
  { name: 'MySQL vs PostgreSQL', description: 'Comparativa técnica entre los dos gestores de bases de datos más populares.', tags: ['database', 'mysql', 'postgresql'], format: 'markdown', content: '# MySQL vs PostgreSQL\n\nAmbas bases de datos tienen sus ventajas...', active: true },
  { name: 'Autenticación con JWT', description: 'Implementando autenticación segura con JSON Web Tokens en tu API.', tags: ['seguridad', 'jwt', 'auth'], format: 'markdown', content: '# Autenticación con JWT\n\nJWT es un estándar abierto para transmitir información...', active: true },
  { name: 'CI/CD con GitHub Actions', description: 'Configura pipelines de integración y despliegue continuo usando GitHub Actions.', tags: ['cicd', 'github', 'devops'], format: 'markdown', content: '# CI/CD con GitHub Actions\n\nAutomatiza tu flujo de trabajo con GitHub Actions...', active: true },
  { name: 'Diseño de APIs REST', description: 'Principios y mejores prácticas para diseñar APIs RESTful robustas.', tags: ['api', 'rest', 'backend'], format: 'markdown', content: '# Diseño de APIs REST\n\nUna buena API REST debe ser intuitiva y consistente...', active: true },
  { name: 'Tailwind CSS: Tips y trucos', description: 'Consejos prácticos para sacar el máximo provecho de Tailwind CSS.', tags: ['css', 'tailwind', 'frontend'], format: 'markdown', content: '# Tailwind CSS: Tips y trucos\n\nTailwind CSS revolucionó la forma en que escribimos estilos...', active: true },
  { name: 'Testing con Japa', description: 'Escribe pruebas efectivas en AdonisJS usando el framework Japa.', tags: ['testing', 'adonisjs', 'japa'], format: 'markdown', content: '# Testing con Japa\n\nJapa es el framework de testing oficial de AdonisJS...', active: true },
  { name: 'Subida de archivos a S3', description: 'Cómo gestionar la subida de archivos a Amazon S3 desde tu API.', tags: ['s3', 'aws', 'backend'], format: 'markdown', content: '# Subida de archivos a S3\n\nAmazon S3 es el servicio de almacenamiento más usado...', active: true },
  { name: 'Optimización de consultas SQL', description: 'Técnicas para mejorar el rendimiento de tus consultas en MySQL.', tags: ['sql', 'performance', 'database'], format: 'markdown', content: '# Optimización de consultas SQL\n\nLas consultas lentas pueden arruinar la experiencia...', active: true },
  { name: 'Multi-tenancy en SaaS', description: 'Patrones de arquitectura para implementar multi-tenancy en aplicaciones SaaS.', tags: ['saas', 'arquitectura', 'backend'], format: 'markdown', content: '# Multi-tenancy en SaaS\n\nEl multi-tenancy es fundamental en aplicaciones SaaS...', active: false },
  { name: 'Nginx como reverse proxy', description: 'Configurando Nginx para servir múltiples aplicaciones con SSL automático.', tags: ['nginx', 'devops', 'ssl'], format: 'markdown', content: '# Nginx como reverse proxy\n\nNginx es una de las herramientas más versátiles...', active: true },
  { name: 'Introducción a Droni Kit', description: 'El sistema de diseño interno de Droni: componentes, tokens y guías de uso.', tags: ['droni', 'design-system', 'vue'], format: 'markdown', content: '# Introducción a Droni Kit\n\nDroni Kit es nuestro sistema de diseño interno...', active: true },
]

const comments = [
  'Excelente artículo, me ayudó mucho a entender el tema.',
  '¿Podrías profundizar más en la sección de configuración?',
  'Llevo semanas buscando esta información, muchas gracias.',
  'Hay un pequeño error en el ejemplo del código, la línea 5 debería ser distinta.',
  'Muy bien explicado, lo recomendaré a mi equipo.',
  'Interesante perspectiva, aunque yo prefiero el enfoque alternativo.',
  '¿Esto funciona también con la versión más antigua?',
  'Acabo de implementarlo y funcionó a la primera, gracias.',
  'El diagrama del final lo aclara todo, deberías ponerlo al principio.',
  'Faltó mencionar el manejo de errores en producción.',
  'Llevaba días con este problema y tu post lo resolvió.',
  '¿Hay algún repositorio de ejemplo que pueda clonar?',
  'Muy completo, pero se siente un poco largo para leerlo de un jalón.',
  'Me parece que el punto 3 contradice lo que dijiste antes.',
  'Esperando la segunda parte de esta serie.',
]

const topics = [
  { name: 'Error al conectar con MySQL en Docker', content: 'Hola, estoy intentando conectar mi API AdonisJS con un contenedor MySQL pero obtengo el error ECONNREFUSED. He revisado las variables de entorno y parecen correctas. ¿Alguna idea?', group: 'soporte' },
  { name: 'Cómo paginar resultados con Lucid ORM', content: 'Quiero implementar paginación en mis endpoints pero no encuentro mucha documentación al respecto. ¿Alguien tiene un ejemplo de cómo usar `.paginate()` con filtros?', group: 'preguntas' },
  { name: 'Sugerencia: soporte para temas personalizados', content: 'Sería genial poder personalizar los colores del theme desde el panel de administración sin tener que tocar el código. ¿Está en el roadmap?', group: 'sugerencias' },
  { name: 'Tutorial: despliegue en VPS con Docker Compose', content: 'He preparado una guía paso a paso para desplegar el stack completo en un VPS usando Docker Compose y Nginx. La comparto por si le sirve a alguien del equipo.', group: 'tutoriales' },
  { name: 'Problema con CORS en producción', content: 'Todo funciona bien en local pero en producción el frontend recibe errores de CORS. Ya revisé el archivo config/cors.ts y agregué mi dominio. ¿Hay algo más que deba configurar?', group: 'soporte' },
  { name: '¿Qué diferencia hay entre auth y silent_auth?', content: 'Veo que en las rutas se usa tanto middleware.auth() como silent_auth pero no entiendo cuándo usar cada uno. ¿Alguien puede explicarme la diferencia?', group: 'preguntas' },
  { name: 'Roadmap Q3 2026', content: 'Me gustaría saber qué funcionalidades están planificadas para el tercer trimestre. En particular me interesan las mejoras en el módulo de contenido.', group: 'sugerencias' },
  { name: 'Cómo usar el validador con archivos', content: 'Estoy intentando validar el tamaño y tipo MIME de archivos antes de subirlos a S3 pero no sé cómo hacerlo con los validadores de AdonisJS 7. ¿Hay algún ejemplo?', group: 'preguntas' },
  { name: 'Error 422 en el endpoint de registro', content: 'Al intentar registrar un usuario nuevo siempre obtengo un 422. El body que envío parece correcto según la documentación. Adjunto el request y response completos.', group: 'soporte' },
  { name: 'Integración con servicios de email externos', content: 'Para el envío de emails de verificación, ¿se puede usar otro proveedor además de Mailjet? Tenemos contrato con SendGrid y preferiríamos no cambiar.', group: 'preguntas' },
  { name: 'Compartir: setup de ESLint + Prettier para AdonisJS', content: 'Aquí dejo mi configuración de ESLint y Prettier optimizada para proyectos AdonisJS 7 con TypeScript. Me tomó un rato afinarla así que espero que les ahorre tiempo.', group: 'tutoriales' },
  { name: 'Los attachments no se eliminan de S3', content: 'Cuando llamo al endpoint DELETE de attachments, el registro se borra de la base de datos pero el archivo sigue existiendo en el bucket. ¿Es un bug conocido?', group: 'soporte' },
  { name: 'Sugerencia: búsqueda full-text en posts', content: 'Actualmente la búsqueda usa LIKE lo cual es lento en tablas grandes. ¿Han considerado implementar búsqueda full-text con MySQL FULLTEXT o Meilisearch?', group: 'sugerencias' },
  { name: 'Cómo extender el modelo User', content: 'Necesito agregar campos adicionales al modelo User (teléfono, país). ¿Es mejor modificar la migración existente o crear una tabla de perfiles separada?', group: 'preguntas' },
  { name: 'Variables de entorno en producción con Docker', content: 'No tengo claro cuál es la forma correcta de pasar las variables de entorno al contenedor en producción. He visto que se puede usar .env, docker-compose env_file y secrets. ¿Cuál recomiendan?', group: 'preguntas' },
]

export default class DummySeeder extends BaseSeeder {
  async run() {
    // Insert posts
    const postIds: string[] = []
    for (const post of posts) {
      const id = crypto.randomUUID()
      postIds.push(id)
      const slug = string.slug(post.name)
      await db.table('content_posts').insert({
        id,
        site_id: SITE_ID,
        user_id: USER_ID,
        slug,
        name: post.name,
        description: post.description,
        tags: JSON.stringify(post.tags),
        content: post.content,
        format: post.format,
        active: post.active ? 1 : 0,
        created_at: new Date(),
        updated_at: new Date(),
      })
    }

    // Insert comments linked to the first 5 posts
    for (let i = 0; i < comments.length; i++) {
      await db.table('social_comments').insert({
        id: crypto.randomUUID(),
        site_id: SITE_ID,
        user_id: USER_ID,
        commentable_type: 'post',
        commentable_id: postIds[i % 5],
        content: comments[i],
        is_edited: 0,
        active: 1,
        created_at: new Date(),
        updated_at: new Date(),
      })
    }

    // Insert topics
    for (const topic of topics) {
      const slug = string.slug(topic.name)
      await db.table('social_topics').insert({
        id: crypto.randomUUID(),
        site_id: SITE_ID,
        user_id: USER_ID,
        name: topic.name,
        slug,
        content: topic.content,
        group: topic.group,
        active: 1,
        created_at: new Date(),
        updated_at: new Date(),
      })
    }
  }
}
