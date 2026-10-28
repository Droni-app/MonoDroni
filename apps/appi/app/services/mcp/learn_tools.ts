import { z } from 'zod'
import type { AppiCall } from '#services/mcp/appi_client'
import { pagination, path, type ToolServer } from '#services/mcp/shared'

const courseSlug = z.string().describe('Slug del curso')
const lessonSlug = z.string().describe('Slug de la lección')

const lessonFields = {
  description: z.string().nullable().optional().describe('Resumen de la lección'),
  format: z.enum(['text', 'html', 'markdown']).optional().describe('Formato de content'),
  content: z.string().nullable().optional().describe('Contenido de la lección'),
  activity: z
    .string()
    .nullable()
    .optional()
    .describe('Enunciado de la actividad que el alumno responde'),
  video: z.string().nullable().optional().describe('URL del video'),
  order: z.number().int().optional().describe('Posición dentro del curso'),
  active: z.boolean().optional().describe('true = visible para los alumnos'),
  limit_date: z
    .string()
    .nullable()
    .optional()
    .describe('Fecha límite para actividad y cuestionario (ISO 8601)'),
}

const questionFields = {
  description: z.string().nullable().optional().describe('Texto adicional de la pregunta'),
  picture: z.string().nullable().optional().describe('URL de una imagen'),
  attachment: z.string().nullable().optional().describe('URL de un adjunto'),
  response_3: z.string().nullable().optional().describe('Opción 3'),
  response_4: z.string().nullable().optional().describe('Opción 4'),
  response_5: z.string().nullable().optional().describe('Opción 5'),
}

const gradeFields = {
  feedback: z.string().nullable().optional().describe('Retroalimentación para el alumno'),
  result: z.number().min(0).max(100).nullable().optional().describe('Nota de 0 a 100'),
}

const quizGradeFields = {
  status: z.enum(['pending', 'completed']).optional().describe('Estado del intento'),
  results: z.number().min(0).max(100).nullable().optional().describe('Nota de 0 a 100'),
}

const enrollmentRole = z.enum(['student', 'teacher', 'admin'])
const enrollmentStatus = z.enum(['pending', 'active', 'completed', 'canceled'])

/**
 * Student + course teacher tools (`learn/*`). Courses and lessons are addressed
 * by slug; permissions come from the course-level role (learn_enrollments.role)
 * checked by the courseRole middleware on each target route.
 */
export function registerLearnTools(server: ToolServer, call: AppiCall) {
  // Catalog & own learning

  server.registerTool(
    'list_courses',
    {
      title: 'Listar cursos',
      description: 'Lista los cursos activos del sitio.',
      inputSchema: { group: z.string().optional().describe('Filtrar por grupo'), ...pagination },
      annotations: { readOnlyHint: true },
    },
    (args) => call('GET', 'learn/courses', { query: args })
  )

  server.registerTool(
    'get_course',
    {
      title: 'Ver curso',
      description:
        'Obtiene un curso activo por slug, incluida la inscripción del usuario si existe.',
      inputSchema: { course_slug: courseSlug },
      annotations: { readOnlyHint: true },
    },
    ({ course_slug: course }) => call('GET', path`learn/courses/${course}`)
  )

  server.registerTool(
    'list_my_courses',
    {
      title: 'Listar mis cursos',
      description:
        'Lista los cursos en los que el usuario autenticado está inscrito, con su progreso.',
      inputSchema: { ...pagination },
      annotations: { readOnlyHint: true },
    },
    (args) => call('GET', 'learn/user/courses', { query: args })
  )

  server.registerTool(
    'list_my_completed_lessons',
    {
      title: 'Listar mis lecciones vistas',
      description: 'Lista las lecciones que el usuario autenticado ya vio, más recientes primero.',
      inputSchema: { ...pagination },
      annotations: { readOnlyHint: true },
    },
    (args) => call('GET', 'learn/user/lessons', { query: args })
  )

  server.registerTool(
    'enroll_in_course',
    {
      title: 'Inscribirme en un curso',
      description:
        'Inscribe al usuario autenticado como alumno. Solo funciona si el curso tiene auto_enroll.',
      inputSchema: { course_slug: courseSlug },
    },
    ({ course_slug: course }) => call('POST', path`learn/courses/${course}/enrollments`)
  )

  server.registerTool(
    'list_lessons',
    {
      title: 'Listar lecciones',
      description:
        'Lista las lecciones de un curso. Los alumnos ven solo las activas; profesores y admins del curso ven todas.',
      inputSchema: { course_slug: courseSlug, ...pagination },
      annotations: { readOnlyHint: true },
    },
    ({ course_slug: course, ...query }) =>
      call('GET', path`learn/courses/${course}/lessons`, { query })
  )

  server.registerTool(
    'get_lesson',
    {
      title: 'Ver lección',
      description:
        'Obtiene una lección con la respuesta y el último intento de cuestionario del usuario, y las preguntas del cuestionario (sin la respuesta correcta). Si el usuario está inscrito, la marca como vista y actualiza su progreso.',
      inputSchema: { course_slug: courseSlug, lesson_slug: lessonSlug },
    },
    ({ course_slug: course, lesson_slug: lesson }) =>
      call('GET', path`learn/courses/${course}/lessons/${lesson}`)
  )

  // Student activity

  server.registerTool(
    'submit_lesson_answer',
    {
      title: 'Responder actividad',
      description:
        'Envía la respuesta del alumno a la actividad de una lección. Requiere ser alumno del curso.',
      inputSchema: {
        course_slug: courseSlug,
        lesson_slug: lessonSlug,
        answer: z.string().describe('Respuesta del alumno'),
        attachment: z.string().nullable().optional().describe('URL de un adjunto'),
      },
    },
    ({ course_slug: course, lesson_slug: lesson, ...body }) =>
      call('POST', path`learn/courses/${course}/lessons/${lesson}/answers`, { body })
  )

  server.registerTool(
    'get_lesson_answer',
    {
      title: 'Ver respuesta de actividad',
      description: 'Obtiene una respuesta de actividad (los alumnos solo ven las propias).',
      inputSchema: {
        course_slug: courseSlug,
        lesson_slug: lessonSlug,
        id: z.string().describe('ID de la respuesta'),
      },
      annotations: { readOnlyHint: true },
    },
    ({ course_slug: course, lesson_slug: lesson, id }) =>
      call('GET', path`learn/courses/${course}/lessons/${lesson}/answers/${id}`)
  )

  server.registerTool(
    'submit_lesson_quiz',
    {
      title: 'Presentar cuestionario',
      description:
        'Envía de una vez las respuestas a TODAS las preguntas del cuestionario de una lección (obtenlas con get_lesson) y devuelve la calificación. Se permiten varios intentos. Requiere ser alumno del curso.',
      inputSchema: {
        course_slug: courseSlug,
        lesson_slug: lessonSlug,
        answers: z
          .array(
            z.object({
              question_id: z.string().describe('ID de la pregunta'),
              selected: z.number().int().min(1).max(5).describe('Opción elegida (1-5)'),
            })
          )
          .min(1)
          .describe('Una respuesta por cada pregunta vinculada a la lección'),
      },
    },
    ({ course_slug: course, lesson_slug: lesson, ...body }) =>
      call('POST', path`learn/courses/${course}/lessons/${lesson}/quizzes`, { body })
  )

  server.registerTool(
    'get_lesson_quiz',
    {
      title: 'Ver intento de cuestionario',
      description: 'Obtiene un intento de cuestionario (los alumnos solo ven los propios).',
      inputSchema: {
        course_slug: courseSlug,
        lesson_slug: lessonSlug,
        id: z.string().describe('ID del intento'),
      },
      annotations: { readOnlyHint: true },
    },
    ({ course_slug: course, lesson_slug: lesson, id }) =>
      call('GET', path`learn/courses/${course}/lessons/${lesson}/quizzes/${id}`)
  )

  // Course teachers/admins (course-level role)

  server.registerTool(
    'teacher_create_lesson',
    {
      title: '[Profesor] Crear lección',
      description:
        'Crea una lección en el curso. El slug se genera a partir del nombre. Requiere ser profesor o admin del curso.',
      inputSchema: {
        course_slug: courseSlug,
        name: z.string().describe('Nombre de la lección'),
        ...lessonFields,
      },
    },
    ({ course_slug: course, ...body }) =>
      call('POST', path`learn/courses/${course}/lessons`, { body })
  )

  server.registerTool(
    'teacher_update_lesson',
    {
      title: '[Profesor] Actualizar lección',
      description:
        'Actualiza los campos enviados de una lección. Requiere ser profesor o admin del curso.',
      inputSchema: {
        course_slug: courseSlug,
        lesson_slug: lessonSlug,
        name: z.string().optional().describe('Nombre de la lección'),
        ...lessonFields,
      },
      annotations: { idempotentHint: true },
    },
    ({ course_slug: course, lesson_slug: lesson, ...body }) =>
      call('PUT', path`learn/courses/${course}/lessons/${lesson}`, { body })
  )

  server.registerTool(
    'teacher_delete_lesson',
    {
      title: '[Admin del curso] Eliminar lección',
      description: 'Elimina una lección. Requiere ser admin del curso.',
      inputSchema: { course_slug: courseSlug, lesson_slug: lessonSlug },
      annotations: { destructiveHint: true },
    },
    ({ course_slug: course, lesson_slug: lesson }) =>
      call('DELETE', path`learn/courses/${course}/lessons/${lesson}`)
  )

  server.registerTool(
    'teacher_list_questions',
    {
      title: '[Profesor] Listar banco de preguntas',
      description:
        'Lista el banco de preguntas de selección múltiple del curso. Requiere ser profesor o admin del curso.',
      inputSchema: { course_slug: courseSlug, ...pagination },
      annotations: { readOnlyHint: true },
    },
    ({ course_slug: course, ...query }) =>
      call('GET', path`learn/courses/${course}/questions`, { query })
  )

  server.registerTool(
    'teacher_get_question',
    {
      title: '[Profesor] Ver pregunta',
      description:
        'Obtiene una pregunta del banco, incluida la respuesta correcta. Requiere ser profesor o admin del curso.',
      inputSchema: { course_slug: courseSlug, id: z.string().describe('ID de la pregunta') },
      annotations: { readOnlyHint: true },
    },
    ({ course_slug: course, id }) => call('GET', path`learn/courses/${course}/questions/${id}`)
  )

  server.registerTool(
    'teacher_create_question',
    {
      title: '[Profesor] Crear pregunta',
      description:
        'Agrega una pregunta de selección múltiple (2 a 5 opciones) al banco del curso. Requiere ser profesor o admin del curso.',
      inputSchema: {
        course_slug: courseSlug,
        name: z.string().describe('Enunciado de la pregunta'),
        response_1: z.string().describe('Opción 1'),
        response_2: z.string().describe('Opción 2'),
        response_correct: z.number().int().min(1).max(5).describe('Número de la opción correcta'),
        ...questionFields,
      },
    },
    ({ course_slug: course, ...body }) =>
      call('POST', path`learn/courses/${course}/questions`, { body })
  )

  server.registerTool(
    'teacher_update_question',
    {
      title: '[Profesor] Actualizar pregunta',
      description:
        'Actualiza los campos enviados de una pregunta del banco. Requiere ser profesor o admin del curso.',
      inputSchema: {
        course_slug: courseSlug,
        id: z.string().describe('ID de la pregunta'),
        name: z.string().optional().describe('Enunciado'),
        response_1: z.string().optional().describe('Opción 1'),
        response_2: z.string().optional().describe('Opción 2'),
        response_correct: z
          .number()
          .int()
          .min(1)
          .max(5)
          .optional()
          .describe('Número de la opción correcta'),
        ...questionFields,
      },
      annotations: { idempotentHint: true },
    },
    ({ course_slug: course, id, ...body }) =>
      call('PUT', path`learn/courses/${course}/questions/${id}`, { body })
  )

  server.registerTool(
    'teacher_delete_question',
    {
      title: '[Admin del curso] Eliminar pregunta',
      description: 'Elimina una pregunta del banco. Requiere ser admin del curso.',
      inputSchema: { course_slug: courseSlug, id: z.string().describe('ID de la pregunta') },
      annotations: { destructiveHint: true },
    },
    ({ course_slug: course, id }) => call('DELETE', path`learn/courses/${course}/questions/${id}`)
  )

  server.registerTool(
    'teacher_list_lesson_exam_questions',
    {
      title: '[Profesor] Listar preguntas del cuestionario',
      description:
        'Lista las preguntas del banco vinculadas al cuestionario de una lección. Requiere ser profesor o admin del curso.',
      inputSchema: { course_slug: courseSlug, lesson_slug: lessonSlug },
      annotations: { readOnlyHint: true },
    },
    ({ course_slug: course, lesson_slug: lesson }) =>
      call('GET', path`learn/courses/${course}/lessons/${lesson}/exam-questions`)
  )

  server.registerTool(
    'teacher_link_exam_question',
    {
      title: '[Profesor] Vincular pregunta al cuestionario',
      description:
        'Agrega una pregunta del banco del curso al cuestionario de una lección. Requiere ser profesor o admin del curso.',
      inputSchema: {
        course_slug: courseSlug,
        lesson_slug: lessonSlug,
        question_id: z.string().describe('ID de la pregunta del banco'),
      },
    },
    ({ course_slug: course, lesson_slug: lesson, ...body }) =>
      call('POST', path`learn/courses/${course}/lessons/${lesson}/exam-questions`, { body })
  )

  server.registerTool(
    'teacher_unlink_exam_question',
    {
      title: '[Profesor] Desvincular pregunta del cuestionario',
      description:
        'Quita una pregunta del cuestionario de una lección (la pregunta sigue en el banco). Requiere ser profesor o admin del curso.',
      inputSchema: {
        course_slug: courseSlug,
        lesson_slug: lessonSlug,
        id: z.string().describe('ID del vínculo (no el de la pregunta)'),
      },
      annotations: { destructiveHint: true },
    },
    ({ course_slug: course, lesson_slug: lesson, id }) =>
      call('DELETE', path`learn/courses/${course}/lessons/${lesson}/exam-questions/${id}`)
  )

  server.registerTool(
    'teacher_list_enrollments',
    {
      title: '[Profesor] Listar inscritos',
      description:
        'Lista los inscritos del curso con su rol, estado y progreso. Requiere ser profesor o admin del curso.',
      inputSchema: { course_slug: courseSlug, ...pagination },
      annotations: { readOnlyHint: true },
    },
    ({ course_slug: course, ...query }) =>
      call('GET', path`learn/courses/${course}/enrollments`, { query })
  )

  server.registerTool(
    'teacher_get_enrollment',
    {
      title: '[Profesor] Ver inscripción',
      description: 'Obtiene una inscripción del curso. Requiere ser profesor o admin del curso.',
      inputSchema: { course_slug: courseSlug, id: z.string().describe('ID de la inscripción') },
      annotations: { readOnlyHint: true },
    },
    ({ course_slug: course, id }) => call('GET', path`learn/courses/${course}/enrollments/${id}`)
  )

  server.registerTool(
    'teacher_list_lesson_answers',
    {
      title: '[Profesor] Listar respuestas de actividad',
      description:
        'Lista las respuestas de los alumnos a la actividad de una lección. Requiere ser profesor o admin del curso.',
      inputSchema: { course_slug: courseSlug, lesson_slug: lessonSlug, ...pagination },
      annotations: { readOnlyHint: true },
    },
    ({ course_slug: course, lesson_slug: lesson, ...query }) =>
      call('GET', path`learn/courses/${course}/lessons/${lesson}/answers`, { query })
  )

  server.registerTool(
    'teacher_grade_lesson_answer',
    {
      title: '[Profesor] Calificar respuesta de actividad',
      description:
        'Pone nota y/o retroalimentación a la respuesta de un alumno. Requiere ser profesor o admin del curso.',
      inputSchema: {
        course_slug: courseSlug,
        lesson_slug: lessonSlug,
        id: z.string().describe('ID de la respuesta'),
        ...gradeFields,
      },
      annotations: { idempotentHint: true },
    },
    ({ course_slug: course, lesson_slug: lesson, id, ...body }) =>
      call('PUT', path`learn/courses/${course}/lessons/${lesson}/answers/${id}`, { body })
  )

  server.registerTool(
    'teacher_delete_lesson_answer',
    {
      title: '[Admin del curso] Eliminar respuesta de actividad',
      description: 'Elimina la respuesta de un alumno. Requiere ser admin del curso.',
      inputSchema: {
        course_slug: courseSlug,
        lesson_slug: lessonSlug,
        id: z.string().describe('ID de la respuesta'),
      },
      annotations: { destructiveHint: true },
    },
    ({ course_slug: course, lesson_slug: lesson, id }) =>
      call('DELETE', path`learn/courses/${course}/lessons/${lesson}/answers/${id}`)
  )

  server.registerTool(
    'teacher_list_lesson_quizzes',
    {
      title: '[Profesor] Listar intentos de cuestionario',
      description:
        'Lista los intentos de cuestionario de los alumnos en una lección. Requiere ser profesor o admin del curso.',
      inputSchema: { course_slug: courseSlug, lesson_slug: lessonSlug, ...pagination },
      annotations: { readOnlyHint: true },
    },
    ({ course_slug: course, lesson_slug: lesson, ...query }) =>
      call('GET', path`learn/courses/${course}/lessons/${lesson}/quizzes`, { query })
  )

  server.registerTool(
    'teacher_update_lesson_quiz',
    {
      title: '[Profesor] Corregir intento de cuestionario',
      description:
        'Corrige el estado o la nota de un intento de cuestionario. Requiere ser profesor o admin del curso.',
      inputSchema: {
        course_slug: courseSlug,
        lesson_slug: lessonSlug,
        id: z.string().describe('ID del intento'),
        ...quizGradeFields,
      },
      annotations: { idempotentHint: true },
    },
    ({ course_slug: course, lesson_slug: lesson, id, ...body }) =>
      call('PUT', path`learn/courses/${course}/lessons/${lesson}/quizzes/${id}`, { body })
  )

  server.registerTool(
    'teacher_delete_lesson_quiz',
    {
      title: '[Admin del curso] Eliminar intento de cuestionario',
      description: 'Elimina un intento de cuestionario. Requiere ser admin del curso.',
      inputSchema: {
        course_slug: courseSlug,
        lesson_slug: lessonSlug,
        id: z.string().describe('ID del intento'),
      },
      annotations: { destructiveHint: true },
    },
    ({ course_slug: course, lesson_slug: lesson, id }) =>
      call('DELETE', path`learn/courses/${course}/lessons/${lesson}/quizzes/${id}`)
  )
}

const courseId = z.string().describe('ID del curso')
const lessonId = z.string().describe('ID de la lección')

const courseFields = {
  group: z.string().nullable().optional().describe('Grupo/categoría del curso'),
  description: z.string().nullable().optional().describe('Descripción'),
  picture: z.string().nullable().optional().describe('URL de la imagen'),
  video: z.string().nullable().optional().describe('URL del video de presentación'),
  auto_enroll: z.boolean().optional().describe('true = cualquier usuario puede inscribirse solo'),
  active: z.boolean().optional().describe('true = visible en el catálogo'),
}

/**
 * Site owner tools (`admin/learn/*`): everything addressed by real id, gated
 * by the adminSite middleware instead of course-level roles.
 */
export function registerLearnAdminTools(server: ToolServer, call: AppiCall) {
  // Courses

  server.registerTool(
    'admin_list_courses',
    {
      title: '[Admin] Listar cursos',
      description: 'Lista todos los cursos del sitio, incluidos los inactivos.',
      inputSchema: {
        q: z.string().optional().describe('Búsqueda por nombre o descripción'),
        group: z.string().optional().describe('Filtrar por grupo'),
        ...pagination,
      },
      annotations: { readOnlyHint: true },
    },
    (args) => call('GET', 'admin/learn/courses', { query: args })
  )

  server.registerTool(
    'admin_get_course',
    {
      title: '[Admin] Ver curso',
      description: 'Obtiene un curso por ID.',
      inputSchema: { id: courseId },
      annotations: { readOnlyHint: true },
    },
    ({ id }) => call('GET', path`admin/learn/courses/${id}`)
  )

  server.registerTool(
    'admin_create_course',
    {
      title: '[Admin] Crear curso',
      description: 'Crea un curso. El slug se genera a partir del nombre.',
      inputSchema: { name: z.string().describe('Nombre del curso'), ...courseFields },
    },
    (body) => call('POST', 'admin/learn/courses', { body })
  )

  server.registerTool(
    'admin_update_course',
    {
      title: '[Admin] Actualizar curso',
      description: 'Actualiza los campos enviados de un curso.',
      inputSchema: {
        id: courseId,
        name: z.string().optional().describe('Nombre'),
        ...courseFields,
      },
      annotations: { idempotentHint: true },
    },
    ({ id, ...body }) => call('PUT', path`admin/learn/courses/${id}`, { body })
  )

  server.registerTool(
    'admin_delete_course',
    {
      title: '[Admin] Eliminar curso',
      description: 'Elimina un curso definitivamente.',
      inputSchema: { id: courseId },
      annotations: { destructiveHint: true },
    },
    ({ id }) => call('DELETE', path`admin/learn/courses/${id}`)
  )

  // Lessons

  server.registerTool(
    'admin_list_lessons',
    {
      title: '[Admin] Listar lecciones',
      description: 'Lista todas las lecciones de un curso.',
      inputSchema: { course_id: courseId, ...pagination },
      annotations: { readOnlyHint: true },
    },
    ({ course_id: course, ...query }) =>
      call('GET', path`admin/learn/courses/${course}/lessons`, { query })
  )

  server.registerTool(
    'admin_get_lesson',
    {
      title: '[Admin] Ver lección',
      description: 'Obtiene una lección por ID.',
      inputSchema: { course_id: courseId, id: lessonId },
      annotations: { readOnlyHint: true },
    },
    ({ course_id: course, id }) => call('GET', path`admin/learn/courses/${course}/lessons/${id}`)
  )

  server.registerTool(
    'admin_create_lesson',
    {
      title: '[Admin] Crear lección',
      description: 'Crea una lección en un curso. El slug se genera a partir del nombre.',
      inputSchema: {
        course_id: courseId,
        name: z.string().describe('Nombre de la lección'),
        ...lessonFields,
      },
    },
    ({ course_id: course, ...body }) =>
      call('POST', path`admin/learn/courses/${course}/lessons`, { body })
  )

  server.registerTool(
    'admin_update_lesson',
    {
      title: '[Admin] Actualizar lección',
      description: 'Actualiza los campos enviados de una lección.',
      inputSchema: {
        course_id: courseId,
        id: lessonId,
        name: z.string().optional().describe('Nombre'),
        ...lessonFields,
      },
      annotations: { idempotentHint: true },
    },
    ({ course_id: course, id, ...body }) =>
      call('PUT', path`admin/learn/courses/${course}/lessons/${id}`, { body })
  )

  server.registerTool(
    'admin_delete_lesson',
    {
      title: '[Admin] Eliminar lección',
      description: 'Elimina una lección.',
      inputSchema: { course_id: courseId, id: lessonId },
      annotations: { destructiveHint: true },
    },
    ({ course_id: course, id }) => call('DELETE', path`admin/learn/courses/${course}/lessons/${id}`)
  )

  // Question bank & lesson exam questions

  server.registerTool(
    'admin_list_questions',
    {
      title: '[Admin] Listar banco de preguntas',
      description: 'Lista el banco de preguntas de un curso.',
      inputSchema: { course_id: courseId, ...pagination },
      annotations: { readOnlyHint: true },
    },
    ({ course_id: course, ...query }) =>
      call('GET', path`admin/learn/courses/${course}/questions`, { query })
  )

  server.registerTool(
    'admin_get_question',
    {
      title: '[Admin] Ver pregunta',
      description: 'Obtiene una pregunta del banco, incluida la respuesta correcta.',
      inputSchema: { course_id: courseId, id: z.string().describe('ID de la pregunta') },
      annotations: { readOnlyHint: true },
    },
    ({ course_id: course, id }) => call('GET', path`admin/learn/courses/${course}/questions/${id}`)
  )

  server.registerTool(
    'admin_create_question',
    {
      title: '[Admin] Crear pregunta',
      description:
        'Agrega una pregunta de selección múltiple (2 a 5 opciones) al banco de un curso.',
      inputSchema: {
        course_id: courseId,
        name: z.string().describe('Enunciado'),
        response_1: z.string().describe('Opción 1'),
        response_2: z.string().describe('Opción 2'),
        response_correct: z.number().int().min(1).max(5).describe('Número de la opción correcta'),
        ...questionFields,
      },
    },
    ({ course_id: course, ...body }) =>
      call('POST', path`admin/learn/courses/${course}/questions`, { body })
  )

  server.registerTool(
    'admin_update_question',
    {
      title: '[Admin] Actualizar pregunta',
      description: 'Actualiza los campos enviados de una pregunta del banco.',
      inputSchema: {
        course_id: courseId,
        id: z.string().describe('ID de la pregunta'),
        name: z.string().optional().describe('Enunciado'),
        response_1: z.string().optional().describe('Opción 1'),
        response_2: z.string().optional().describe('Opción 2'),
        response_correct: z
          .number()
          .int()
          .min(1)
          .max(5)
          .optional()
          .describe('Número de la opción correcta'),
        ...questionFields,
      },
      annotations: { idempotentHint: true },
    },
    ({ course_id: course, id, ...body }) =>
      call('PUT', path`admin/learn/courses/${course}/questions/${id}`, { body })
  )

  server.registerTool(
    'admin_delete_question',
    {
      title: '[Admin] Eliminar pregunta',
      description: 'Elimina una pregunta del banco.',
      inputSchema: { course_id: courseId, id: z.string().describe('ID de la pregunta') },
      annotations: { destructiveHint: true },
    },
    ({ course_id: course, id }) =>
      call('DELETE', path`admin/learn/courses/${course}/questions/${id}`)
  )

  server.registerTool(
    'admin_list_lesson_exam_questions',
    {
      title: '[Admin] Listar preguntas del cuestionario',
      description: 'Lista las preguntas vinculadas al cuestionario de una lección.',
      inputSchema: { course_id: courseId, lesson_id: lessonId },
      annotations: { readOnlyHint: true },
    },
    ({ course_id: course, lesson_id: lesson }) =>
      call('GET', path`admin/learn/courses/${course}/lessons/${lesson}/exam-questions`)
  )

  server.registerTool(
    'admin_link_exam_question',
    {
      title: '[Admin] Vincular pregunta al cuestionario',
      description: 'Agrega una pregunta del banco del curso al cuestionario de una lección.',
      inputSchema: {
        course_id: courseId,
        lesson_id: lessonId,
        question_id: z.string().describe('ID de la pregunta del banco'),
      },
    },
    ({ course_id: course, lesson_id: lesson, ...body }) =>
      call('POST', path`admin/learn/courses/${course}/lessons/${lesson}/exam-questions`, { body })
  )

  server.registerTool(
    'admin_unlink_exam_question',
    {
      title: '[Admin] Desvincular pregunta del cuestionario',
      description:
        'Quita una pregunta del cuestionario de una lección (la pregunta sigue en el banco).',
      inputSchema: {
        course_id: courseId,
        lesson_id: lessonId,
        id: z.string().describe('ID del vínculo (no el de la pregunta)'),
      },
      annotations: { destructiveHint: true },
    },
    ({ course_id: course, lesson_id: lesson, id }) =>
      call('DELETE', path`admin/learn/courses/${course}/lessons/${lesson}/exam-questions/${id}`)
  )

  // Activity answers & quiz attempts

  server.registerTool(
    'admin_list_lesson_answers',
    {
      title: '[Admin] Listar respuestas de actividad',
      description: 'Lista las respuestas de los alumnos a la actividad de una lección.',
      inputSchema: { course_id: courseId, lesson_id: lessonId, ...pagination },
      annotations: { readOnlyHint: true },
    },
    ({ course_id: course, lesson_id: lesson, ...query }) =>
      call('GET', path`admin/learn/courses/${course}/lessons/${lesson}/answers`, { query })
  )

  server.registerTool(
    'admin_get_lesson_answer',
    {
      title: '[Admin] Ver respuesta de actividad',
      description: 'Obtiene una respuesta de actividad por ID.',
      inputSchema: {
        course_id: courseId,
        lesson_id: lessonId,
        id: z.string().describe('ID de la respuesta'),
      },
      annotations: { readOnlyHint: true },
    },
    ({ course_id: course, lesson_id: lesson, id }) =>
      call('GET', path`admin/learn/courses/${course}/lessons/${lesson}/answers/${id}`)
  )

  server.registerTool(
    'admin_create_lesson_answer',
    {
      title: '[Admin] Registrar respuesta de actividad',
      description:
        'Registra manualmente la respuesta de un alumno (el usuario debe estar inscrito en el curso).',
      inputSchema: {
        course_id: courseId,
        lesson_id: lessonId,
        user_id: z.string().describe('ID del usuario'),
        answer: z.string().describe('Respuesta'),
        attachment: z.string().nullable().optional().describe('URL de un adjunto'),
        ...gradeFields,
      },
    },
    ({ course_id: course, lesson_id: lesson, ...body }) =>
      call('POST', path`admin/learn/courses/${course}/lessons/${lesson}/answers`, { body })
  )

  server.registerTool(
    'admin_update_lesson_answer',
    {
      title: '[Admin] Calificar respuesta de actividad',
      description:
        'Actualiza la respuesta, la nota o la retroalimentación de una respuesta de actividad.',
      inputSchema: {
        course_id: courseId,
        lesson_id: lessonId,
        id: z.string().describe('ID de la respuesta'),
        answer: z.string().optional().describe('Respuesta'),
        attachment: z.string().nullable().optional().describe('URL de un adjunto'),
        ...gradeFields,
      },
      annotations: { idempotentHint: true },
    },
    ({ course_id: course, lesson_id: lesson, id, ...body }) =>
      call('PUT', path`admin/learn/courses/${course}/lessons/${lesson}/answers/${id}`, { body })
  )

  server.registerTool(
    'admin_delete_lesson_answer',
    {
      title: '[Admin] Eliminar respuesta de actividad',
      description: 'Elimina una respuesta de actividad.',
      inputSchema: {
        course_id: courseId,
        lesson_id: lessonId,
        id: z.string().describe('ID de la respuesta'),
      },
      annotations: { destructiveHint: true },
    },
    ({ course_id: course, lesson_id: lesson, id }) =>
      call('DELETE', path`admin/learn/courses/${course}/lessons/${lesson}/answers/${id}`)
  )

  server.registerTool(
    'admin_list_lesson_quizzes',
    {
      title: '[Admin] Listar intentos de cuestionario',
      description: 'Lista los intentos de cuestionario de una lección.',
      inputSchema: { course_id: courseId, lesson_id: lessonId, ...pagination },
      annotations: { readOnlyHint: true },
    },
    ({ course_id: course, lesson_id: lesson, ...query }) =>
      call('GET', path`admin/learn/courses/${course}/lessons/${lesson}/quizzes`, { query })
  )

  server.registerTool(
    'admin_get_lesson_quiz',
    {
      title: '[Admin] Ver intento de cuestionario',
      description: 'Obtiene un intento de cuestionario por ID.',
      inputSchema: {
        course_id: courseId,
        lesson_id: lessonId,
        id: z.string().describe('ID del intento'),
      },
      annotations: { readOnlyHint: true },
    },
    ({ course_id: course, lesson_id: lesson, id }) =>
      call('GET', path`admin/learn/courses/${course}/lessons/${lesson}/quizzes/${id}`)
  )

  server.registerTool(
    'admin_update_lesson_quiz',
    {
      title: '[Admin] Corregir intento de cuestionario',
      description: 'Corrige el estado o la nota de un intento de cuestionario.',
      inputSchema: {
        course_id: courseId,
        lesson_id: lessonId,
        id: z.string().describe('ID del intento'),
        ...quizGradeFields,
      },
      annotations: { idempotentHint: true },
    },
    ({ course_id: course, lesson_id: lesson, id, ...body }) =>
      call('PUT', path`admin/learn/courses/${course}/lessons/${lesson}/quizzes/${id}`, { body })
  )

  server.registerTool(
    'admin_delete_lesson_quiz',
    {
      title: '[Admin] Eliminar intento de cuestionario',
      description: 'Elimina un intento de cuestionario.',
      inputSchema: {
        course_id: courseId,
        lesson_id: lessonId,
        id: z.string().describe('ID del intento'),
      },
      annotations: { destructiveHint: true },
    },
    ({ course_id: course, lesson_id: lesson, id }) =>
      call('DELETE', path`admin/learn/courses/${course}/lessons/${lesson}/quizzes/${id}`)
  )

  // Enrollments

  server.registerTool(
    'admin_list_enrollments',
    {
      title: '[Admin] Listar inscripciones',
      description: 'Lista las inscripciones a cursos del sitio.',
      inputSchema: {
        course_id: courseId.optional(),
        role: enrollmentRole.optional().describe('Filtrar por rol en el curso'),
        status: enrollmentStatus.optional().describe('Filtrar por estado'),
        ...pagination,
      },
      annotations: { readOnlyHint: true },
    },
    (args) => call('GET', 'admin/learn/enrollments', { query: args })
  )

  server.registerTool(
    'admin_get_enrollment',
    {
      title: '[Admin] Ver inscripción',
      description: 'Obtiene una inscripción por ID.',
      inputSchema: { id: z.string().describe('ID de la inscripción') },
      annotations: { readOnlyHint: true },
    },
    ({ id }) => call('GET', path`admin/learn/enrollments/${id}`)
  )

  server.registerTool(
    'admin_enroll_user',
    {
      title: '[Admin] Inscribir usuario',
      description:
        'Inscribe un usuario del sitio en un curso con un rol (student, teacher o admin del curso). Busca el user_id con admin_search_site_users.',
      inputSchema: {
        course_id: courseId,
        user_id: z.string().describe('ID del usuario'),
        role: enrollmentRole.optional().describe('Rol en el curso (default student)'),
        status: enrollmentStatus.optional().describe('Estado de la inscripción'),
      },
    },
    (body) => call('POST', 'admin/learn/enrollments', { body })
  )

  server.registerTool(
    'admin_update_enrollment',
    {
      title: '[Admin] Actualizar inscripción',
      description: 'Cambia el rol, estado o progreso de una inscripción.',
      inputSchema: {
        id: z.string().describe('ID de la inscripción'),
        role: enrollmentRole.optional().describe('Rol en el curso'),
        status: enrollmentStatus.optional().describe('Estado'),
        progress: z.number().min(0).max(100).optional().describe('Progreso (0-100)'),
      },
      annotations: { idempotentHint: true },
    },
    ({ id, ...body }) => call('PUT', path`admin/learn/enrollments/${id}`, { body })
  )

  server.registerTool(
    'admin_delete_enrollment',
    {
      title: '[Admin] Eliminar inscripción',
      description: 'Elimina la inscripción de un usuario a un curso.',
      inputSchema: { id: z.string().describe('ID de la inscripción') },
      annotations: { destructiveHint: true },
    },
    ({ id }) => call('DELETE', path`admin/learn/enrollments/${id}`)
  )

  server.registerTool(
    'admin_search_site_users',
    {
      title: '[Admin] Buscar usuarios del sitio',
      description:
        'Busca usuarios inscritos en el sitio por nombre o email, para asignarlos a un curso.',
      inputSchema: { q: z.string().optional().describe('Nombre o email') },
      annotations: { readOnlyHint: true },
    },
    (args) => call('GET', 'admin/learn/site-users', { query: args })
  )
}
