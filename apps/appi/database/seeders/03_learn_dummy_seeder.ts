import { BaseSeeder } from '@adonisjs/lucid/seeders'
import string from '@adonisjs/core/helpers/string'
import { DateTime } from 'luxon'
import User from '#models/user'
import LearnCourse from '#models/learn/course'
import LearnLesson from '#models/learn/lesson'
import LearnQuestion from '#models/learn/question'
import LearnLessonQuestion from '#models/learn/lesson_question'
import LearnEnrollment from '#models/learn/enrollment'
import LearnLessonView from '#models/learn/lesson_view'
import LearnLessonAnswer from '#models/learn/lesson_answer'
import LearnLessonQuestionsQuiz from '#models/learn/lesson_questions_quiz'

const SITE_ID = '4ebaccf5-b863-4f12-aa49-9bbe0e1844e2'
const ownerUser = await User.firstOrFail()
const studentUser = await User.firstOrFail()

export default class LearnDummySeeder extends BaseSeeder {
  async run() {
    await this.seedJavascriptCourse()
    await this.seedMysqlCourse()
    await this.seedUxCourse()
  }

  // Course 1: auto-enroll, fully populated with views/answers/quiz attempt
  private async seedJavascriptCourse() {
    const course = await LearnCourse.firstOrCreate(
      { siteId: SITE_ID, slug: string.slug('Fundamentos de JavaScript') },
      {
        siteId: SITE_ID,
        slug: string.slug('Fundamentos de JavaScript'),
        name: 'Fundamentos de JavaScript',
        group: 'Programación',
        description:
          'Aprende las bases del lenguaje que corre en todos lados: variables, funciones, scope y tu primer proyecto.',
        picture:
          'https://dronico.nyc3.digitaloceanspaces.com/4ebaccf5-b863-4f12-aa49-9bbe0e1844e2/db7d4d54-7354-4421-9682-d1b75b1f1413/74529-dronico-card.png.png',
        video: 'https://www.youtube.com/watch?v=W6NZfCO5SIk',
        autoEnroll: true,
        active: true,
      }
    )
    const courseId = course.id

    const lessons = [
      {
        name: 'Introducción a JavaScript',
        description: 'Qué es JavaScript, dónde corre y por qué es tan popular.',
        content:
          '# Introducción a JavaScript\n\nJavaScript es el lenguaje de programación de la web...',
        activity: null,
        order: 1,
      },
      {
        name: 'Variables y tipos de datos',
        description: 'const, let, var y los tipos primitivos de JavaScript.',
        content:
          '# Variables y tipos de datos\n\nEn JavaScript existen tres formas de declarar variables...',
        activity:
          'Escribe un fragmento de código que declare 3 variables (string, number y boolean) y explica por qué usaste `const` o `let` en cada caso.',
        order: 2,
      },
      {
        name: 'Funciones y scope',
        description: 'Funciones tradicionales, arrow functions y el alcance de las variables.',
        content: '# Funciones y scope\n\nLas funciones son bloques de código reutilizables...',
        activity:
          'Escribe una función que reciba un arreglo de números y devuelva solo los pares, usando arrow function.',
        order: 3,
      },
      {
        name: 'Proyecto final: Calculadora',
        description: 'Integra todo lo aprendido construyendo una calculadora de consola.',
        content: '# Proyecto final\n\nEs momento de poner en práctica lo aprendido...',
        activity: 'Sube el enlace a tu repositorio con la calculadora funcionando.',
        order: 4,
        limitDate: DateTime.now().plus({ days: 30 }), // 30 days from now
      },
      {
        name: 'Lección en revisión (borrador)',
        description:
          'Contenido todavía no publicado, usado para probar el filtro de lecciones activas.',
        content: '# Borrador\n\nEste contenido aún no está listo.',
        activity: null,
        order: 5,
        active: false,
      },
    ]

    const lessonIds: string[] = []
    for (const lesson of lessons) {
      const createdLesson = await LearnLesson.firstOrCreate(
        { courseId, slug: string.slug(lesson.name) },
        {
          courseId,
          slug: string.slug(lesson.name),
          name: lesson.name,
          description: lesson.description,
          format: 'markdown',
          content: lesson.content,
          activity: lesson.activity,
          video: null,
          order: lesson.order,
          active: lesson.active !== false,
          limitDate: lesson.limitDate ?? null,
        }
      )
      lessonIds.push(createdLesson.id)
    }
    const [lesson1Id, lesson2Id, lesson3Id] = lessonIds

    const questions = [
      {
        name: '¿Cuál es el resultado de `typeof null`?',
        r1: 'object',
        r2: 'undefined',
        r3: 'null',
        r4: 'number',
        r5: 'function',
        correct: 1,
      },
      {
        name: '¿Qué función convierte un string en un número entero?',
        r1: 'parseInt()',
        r2: 'parseFloat()',
        r3: 'toString()',
        r4: 'Number.isInteger()',
        r5: 'String()',
        correct: 1,
      },
      {
        name: '¿Qué palabra clave declara una variable de solo lectura?',
        r1: 'const',
        r2: 'let',
        r3: 'var',
        r4: 'static',
        r5: 'readonly',
        correct: 1,
      },
      {
        name: '¿Qué devuelve `typeof function(){}`?',
        r1: 'function',
        r2: 'object',
        r3: 'undefined',
        r4: 'symbol',
        r5: 'class',
        correct: 1,
      },
      {
        name: '¿Cómo se define una arrow function vacía?',
        r1: '() => {}',
        r2: 'function() =>',
        r3: '=> function()',
        r4: 'function => ()',
        r5: '()=>function',
        correct: 1,
      },
    ]
    const questionIds: string[] = []
    for (const q of questions) {
      const question = await LearnQuestion.firstOrCreate(
        { courseId, name: q.name },
        {
          courseId,
          name: q.name,
          description: null,
          picture: null,
          attachment: null,
          response1: q.r1,
          response2: q.r2,
          response3: q.r3,
          response4: q.r4,
          response5: q.r5,
          responseCorrect: q.correct,
          wons: 0,
          losses: 0,
          difficulty: '0',
        }
      )
      questionIds.push(question.id)
    }

    // Link the first 3 questions to lesson 3 ("Funciones y scope")
    const linkedQuestionIds = questionIds.slice(0, 3)
    for (const questionId of linkedQuestionIds) {
      await LearnLessonQuestion.firstOrCreate(
        { lessonId: lesson3Id, questionId },
        { lessonId: lesson3Id, questionId }
      )
    }

    // Enrollments
    const studentEnrollment = await LearnEnrollment.firstOrCreate(
      { courseId, userId: studentUser.id },
      { courseId, userId: studentUser.id, role: 'student', status: 'active', progress: '50' }
    )
    await LearnEnrollment.firstOrCreate(
      { courseId, userId: ownerUser.id },
      { courseId, userId: ownerUser.id, role: 'teacher', status: 'active', progress: '0' }
    )
    const studentEnrollmentId = studentEnrollment.id

    // Student viewed lessons 1 and 2 (out of 4 active lessons => 50% progress)
    await LearnLessonView.firstOrCreate(
      { lessonId: lesson1Id, learnEnrollmentId: studentEnrollmentId },
      { lessonId: lesson1Id, learnEnrollmentId: studentEnrollmentId }
    )
    await LearnLessonView.firstOrCreate(
      { lessonId: lesson2Id, learnEnrollmentId: studentEnrollmentId },
      { lessonId: lesson2Id, learnEnrollmentId: studentEnrollmentId }
    )

    // Student submitted the lesson 2 activity, not graded yet
    await LearnLessonAnswer.firstOrCreate(
      { lessonId: lesson2Id, learnEnrollmentId: studentEnrollmentId },
      {
        lessonId: lesson2Id,
        learnEnrollmentId: studentEnrollmentId,
        answer:
          'const nombre = "Kalvin"; let edad = 28; var esActivo = true; // uso const porque nombre no cambia, let porque edad sí podría actualizarse.',
        attachment: null,
        feedback: null,
        result: null,
      }
    )

    // Student completed the quiz on lesson 3 (2 correct, 1 incorrect)
    const gradedAnswers = [
      { question_id: linkedQuestionIds[0], selected: 1, correct: true },
      { question_id: linkedQuestionIds[1], selected: 1, correct: true },
      { question_id: linkedQuestionIds[2], selected: 2, correct: false },
    ]
    const questionsSnapshot = linkedQuestionIds.map((id, index) => {
      const q = questions[index]
      return {
        id,
        name: q.name,
        response_1: q.r1,
        response_2: q.r2,
        response_3: q.r3,
        response_4: q.r4,
        response_5: q.r5,
        response_correct: q.correct,
      }
    })
    await LearnLessonQuestionsQuiz.firstOrCreate(
      { lessonId: lesson3Id, learnEnrollmentId: studentEnrollmentId },
      {
        lessonId: lesson3Id,
        learnEnrollmentId: studentEnrollmentId,
        questions: JSON.stringify(questionsSnapshot),
        answers: JSON.stringify(gradedAnswers),
        status: 'completed',
        results: '66.67',
      }
    )
    // Reflect the quiz result on the question bank (wons/losses/difficulty)
    await LearnQuestion.query()
      .where('id', linkedQuestionIds[0])
      .update({ wons: 1, losses: 0, difficulty: 0 })
    await LearnQuestion.query()
      .where('id', linkedQuestionIds[1])
      .update({ wons: 1, losses: 0, difficulty: 0 })
    await LearnQuestion.query()
      .where('id', linkedQuestionIds[2])
      .update({ wons: 0, losses: 1, difficulty: 100 })
  }

  // Course 2: manual-enrollment only ("por invitación"), fresh enrollment with no activity yet
  private async seedMysqlCourse() {
    const course = await LearnCourse.firstOrCreate(
      { siteId: SITE_ID, slug: string.slug('Bases de Datos con MySQL') },
      {
        siteId: SITE_ID,
        slug: string.slug('Bases de Datos con MySQL'),
        name: 'Bases de Datos con MySQL',
        group: 'Programación',
        description: 'Modela, consulta y optimiza bases de datos relacionales usando MySQL.',
        picture: null,
        video: null,
        autoEnroll: false,
        active: true,
      }
    )
    const courseId = course.id

    const lessons = [
      {
        name: 'Modelado de datos',
        description: 'Entidades, relaciones y normalización.',
        content:
          '# Modelado de datos\n\nAntes de escribir una sola consulta, hay que modelar bien...',
        activity: null,
        order: 1,
        limitDate: null,
      },
      {
        name: 'Consultas SQL básicas',
        description: 'SELECT, WHERE, JOIN y agregaciones.',
        content: '# Consultas SQL básicas\n\nEl comando SELECT es el más usado en SQL...',
        activity:
          'Escribe una consulta que combine (JOIN) dos tablas y filtre resultados con WHERE.',
        order: 2,
        limitDate: null,
      },
      {
        name: 'Índices y optimización',
        description: 'Cómo acelerar tus consultas con índices bien diseñados.',
        content:
          '# Índices y optimización\n\nUn índice mal diseñado puede ser peor que no tener índice...',
        activity: 'Analiza una consulta lenta con EXPLAIN y propone un índice para mejorarla.',
        order: 3,
        limitDate: DateTime.now().minus({ days: 5 }), // vencida hace 5 días, para probar el rechazo por fecha límite
      },
    ]
    const lessonIds: string[] = []
    for (const lesson of lessons) {
      const createdLesson = await LearnLesson.firstOrCreate(
        { courseId, slug: string.slug(lesson.name) },
        {
          courseId,
          slug: string.slug(lesson.name),
          name: lesson.name,
          description: lesson.description,
          format: 'markdown',
          content: lesson.content,
          activity: lesson.activity,
          video: null,
          order: lesson.order,
          active: true,
          limitDate: lesson.limitDate,
        }
      )
      lessonIds.push(createdLesson.id)
    }
    const [, lesson2Id] = lessonIds

    const questions = [
      {
        name: '¿Qué comando SQL crea una tabla nueva?',
        r1: 'CREATE TABLE',
        r2: 'NEW TABLE',
        r3: 'ADD TABLE',
        r4: 'MAKE TABLE',
        r5: 'INSERT TABLE',
        correct: 1,
      },
      {
        name: '¿Qué cláusula se usa para filtrar filas?',
        r1: 'WHERE',
        r2: 'FILTER',
        r3: 'HAVING',
        r4: 'ORDER BY',
        r5: 'GROUP',
        correct: 1,
      },
      {
        name: '¿Cuál es el tipo de índice más común en MySQL?',
        r1: 'B-TREE',
        r2: 'HASH',
        r3: 'BITMAP',
        r4: 'FULLTEXT',
        r5: 'R-TREE',
        correct: 1,
      },
    ]
    const questionIds: string[] = []
    for (const q of questions) {
      const question = await LearnQuestion.firstOrCreate(
        { courseId, name: q.name },
        {
          courseId,
          name: q.name,
          description: null,
          picture: null,
          attachment: null,
          response1: q.r1,
          response2: q.r2,
          response3: q.r3,
          response4: q.r4,
          response5: q.r5,
          responseCorrect: q.correct,
          wons: 0,
          losses: 0,
          difficulty: '0',
        }
      )
      questionIds.push(question.id)
    }
    for (const questionId of questionIds) {
      await LearnLessonQuestion.firstOrCreate(
        { lessonId: lesson2Id, questionId },
        { lessonId: lesson2Id, questionId }
      )
    }

    // Only the site owner is enrolled here (manually, since auto_enroll is off)
    await LearnEnrollment.firstOrCreate(
      { courseId, userId: ownerUser.id },
      { courseId, userId: ownerUser.id, role: 'admin', status: 'active', progress: '0' }
    )
  }

  // Course 3: auto-enroll, includes course video, pending enrollment with zero progress
  private async seedUxCourse() {
    const course = await LearnCourse.firstOrCreate(
      { siteId: SITE_ID, slug: string.slug('Diseño UX/UI para Developers') },
      {
        siteId: SITE_ID,
        slug: string.slug('Diseño UX/UI para Developers'),
        name: 'Diseño UX/UI para Developers',
        group: 'Diseño',
        description:
          'Principios de UX/UI y design systems, pensado para quienes programan y quieren dejar de romper la interfaz.',
        picture: null,
        video: 'https://www.youtube.com/watch?v=c9Wg6Cb_YlU',
        autoEnroll: true,
        active: true,
      }
    )
    const courseId = course.id

    const lessons = [
      {
        name: 'Principios de UX',
        description: 'Usabilidad, jerarquía visual y consistencia.',
        content: '# Principios de UX\n\nUn buen diseño no se nota, un mal diseño sí...',
        activity: null,
        order: 1,
      },
      {
        name: 'Design systems y componentes',
        description: 'Cómo pensar en componentes reutilizables como Droni Kit.',
        content:
          '# Design systems y componentes\n\nUn design system evita reinventar el botón cada vez...',
        activity:
          'Elige un componente de tu proyecto actual y documenta sus variantes (color, tamaño, estado).',
        order: 2,
      },
      {
        name: 'Prototipado rápido',
        description: 'De la idea al prototipo navegable en minutos.',
        content: '# Prototipado rápido\n\nNo necesitas ser diseñador para prototipar...',
        activity:
          'Sube una captura o enlace de un prototipo de baja fidelidad de una pantalla de tu app.',
        order: 3,
      },
    ]
    const lessonIds: string[] = []
    for (const lesson of lessons) {
      const createdLesson = await LearnLesson.firstOrCreate(
        { courseId, slug: string.slug(lesson.name) },
        {
          courseId,
          slug: string.slug(lesson.name),
          name: lesson.name,
          description: lesson.description,
          format: 'markdown',
          content: lesson.content,
          activity: lesson.activity,
          video: null,
          order: lesson.order,
          active: true,
          limitDate: null,
        }
      )
      lessonIds.push(createdLesson.id)
    }
    const [, lesson2Id] = lessonIds

    const questions = [
      {
        name: '¿Qué principio busca que la interfaz sea predecible?',
        r1: 'Consistencia',
        r2: 'Skeuomorfismo',
        r3: 'Minimalismo',
        r4: 'Gamificación',
        r5: 'Parallax',
        correct: 1,
      },
      {
        name: '¿Qué es un design token?',
        r1: 'Un valor de diseño reutilizable (color, espaciado, etc.)',
        r2: 'Un componente de React',
        r3: 'Un tipo de animación',
        r4: 'Un archivo de fuente',
        r5: 'Un plugin de Figma',
        correct: 1,
      },
      {
        name: '¿Qué herramienta se usa comúnmente para prototipar?',
        r1: 'Figma',
        r2: 'MySQL Workbench',
        r3: 'Postman',
        r4: 'Webpack',
        r5: 'Docker Desktop',
        correct: 1,
      },
      {
        name: '¿Qué mide la usabilidad de una interfaz?',
        r1: 'Qué tan fácil es de usar y aprender',
        r2: 'La cantidad de colores usados',
        r3: 'El peso del archivo CSS',
        r4: 'El número de animaciones',
        r5: 'La cantidad de íconos',
        correct: 1,
      },
    ]
    const questionIds: string[] = []
    for (const q of questions) {
      const question = await LearnQuestion.firstOrCreate(
        { courseId, name: q.name },
        {
          courseId,
          name: q.name,
          description: null,
          picture: null,
          attachment: null,
          response1: q.r1,
          response2: q.r2,
          response3: q.r3,
          response4: q.r4,
          response5: q.r5,
          responseCorrect: q.correct,
          wons: 0,
          losses: 0,
          difficulty: '0',
        }
      )
      questionIds.push(question.id)
    }
    for (const questionId of questionIds.slice(0, 2)) {
      await LearnLessonQuestion.firstOrCreate(
        { lessonId: lesson2Id, questionId },
        { lessonId: lesson2Id, questionId }
      )
    }

    // Student enrolled but hasn't started yet (pending, 0 progress)
    await LearnEnrollment.firstOrCreate(
      { courseId, userId: studentUser.id },
      { courseId, userId: studentUser.id, role: 'student', status: 'pending', progress: '0' }
    )
    await LearnEnrollment.firstOrCreate(
      { courseId, userId: ownerUser.id },
      { courseId, userId: ownerUser.id, role: 'admin', status: 'active', progress: '0' }
    )
  }
}
