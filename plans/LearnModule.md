# Modulo de eLearning (Learn Module)

## Appi
### Modelos
- learn_courses
  - id uuid
  - site_id uuid
  - slug string (unique per site)
  - name string
  - group string
  - description text
  - picture string
  - video string
  - auto_enroll boolean
  - active boolean
  - created_at timestamp
  - updated_at timestamp

### learn_enrollments
  - id uuid
  - course_id uuid
  - user_id uuid (unique per course and user)
  - role string (student, teacher, admin)
  - status string (pending, active, completed, canceled)
  - progress decimal
  - created_at timestamp
  - updated_at timestamp

### learn_lessons
  - id uuid
  - course_id uuid
  - slug string (unique per course)
  - name string
  - description text
  - format string (text, html, markdown)
  - content longtext
  - activity longtext
  - video string
  - order integer
  - active boolean
  - limit_date timestamp
  - created_at timestamp
  - updated_at timestamp

### learn_lesson_views
  - id uuid
  - lesson_id uuid
  - learn_enrollment_id uuid (unique per lesson and enrollment)
  - created_at timestamp
  - updated_at timestamp

### learn_lesson_answers
  - id uuid
  - lesson_id uuid
  - learn_enrollment_id uuid (unique per lesson and enrollment)
  - answer text
  - attachment string
  - feedback text
  - result decimal
  - created_at timestamp
  - updated_at timestamp

### learn_questions
  - id uuid
  - course_id uuid
  - name string
  - description text
  - picture string
  - attachment string
  - response_1 string
  - response_2 string
  - response_3 string
  - response_4 string
  - response_5 string
  - response_correct integer
  - wons integer
  - losses integer
  - difficulty decimal
  - created_at timestamp
  - updated_at timestamp

### learn_lesson_questions
  - id uuid
  - lesson_id uuid
  - question_id uuid
  - created_at timestamp
  - updated_at timestamp

### learn_lesson_questions_quizzes
  - id uuid
  - lesson_id uuid
  - learn_enrollment_id uuid
  - questions array of objects
  - answers array of objects
  - status string (pending, completed)
  - results decimal
  - created_at timestamp
  - updated_at timestamp

### Controllers
admin/learn/
  - courses (index, store, show, update, destroy)
  - enrollments (index, store, show, update, destroy)
  - lessons (index, store, show, update, destroy)
  - answers (index, store, show, update, destroy)
  - questions (index, store, show, update, destroy)
  - quizzes (index, store, show, update, destroy)

learn/
  - courses
    - public: index, show (all users where active = true)
  - courses.questions
    - role teacher: index, show, update
    - role admin: index, store, show, update, destroy
  - courses.lessons 
    - public: index, show (all users where active = true)
    - role teacher: index, show, store, update (active any)
    - role admin: index, show, store, update, destroy (active any)
  - courses.lessons.answers
    - role student: store, show
    - role teacher: index, show, update
    - role admin: index, show, update, destroy
  - courses.lessons.quizzes
    - role student: store, show
    - role teacher: index, show, update
    - role admin: index, show, update, destroy
  - courses.enrollments
    - public: store (all users when course auto_enroll = true)
    - role teacher: index, show
    - role admin: index, store, show, update, destroy

## Drodmin
learn/courses
  - Listar cursos
  - Crear curso
  - Editar curso
  - Eliminar curso
learn/courses/lessons
  - Listar lecciones
  - Crear lección
  - Editar lección
  - Eliminar lección
learn/courses/questions
  - Listar preguntas
  - Crear pregunta
  - Editar pregunta
  - Eliminar pregunta
learn/courses/enrollments
  - Listar inscripciones
  - Crear inscripción
  - Editar inscripción
  - Eliminar inscripción
learn/courses/lessons/answers
  - Listar respuestas
  - Crear respuesta
  - Editar respuesta
  - Eliminar respuesta
learn/courses/lessons/quizzes
  - Listar cuestionarios
  - Crear cuestionario
  - Editar cuestionario
  - Eliminar cuestionario


## Consideraciones
- Un usuario solo puede hacer autoenrollment si el curso tiene auto_enroll = true.
- Cada vez que se guarde una respuesta de lección, vista de lección o cuestionario, se debe actualizar el progress del usuario en el curso.
- El campos results de learn_lesson_questions_quizzes debe ser calculado en base a las respuestas correctas y el total de preguntas. dando un porcentaje de aciertos.
- Una leccion puede o no tener actividad, si no tiene actividad, el campo activity debe ser null y el estudiante no podra enviar respuesta, solo ver la leccion.
- el campo difficulty de learn_questions debe ser calculado en base a la cantidad de wons y losses, dando un porcentaje de aciertos.
- En drodmin learn/enrollements, al crear un enrollment, se debe poder seleccionar un usuario, el rol y varios cursos (pueden estar filtrados por grupo) a la vez para poder asignarlos de manera masiva haciendo varias llamadas al api.
- Debes tener en cuenta que Appi es multitenant asi que cada curso, leccion, pregunta, respuesta, cuestionario y enrollment debe estar asociado a un site_id directamente o por heerencia.