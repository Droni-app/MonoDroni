type Color = 'neutral' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'

// Every status/role value used across modules, with its label and badge color.
export const STATUS: Record<string, { label: string; color: Color }> = {
  // orders / payments / enrollments / quizzes
  pending: { label: 'Pendiente', color: 'warning' },
  paid: { label: 'Pagado', color: 'primary' },
  shipped: { label: 'Enviado', color: 'secondary' },
  completed: { label: 'Completado', color: 'success' },
  canceled: { label: 'Cancelado', color: 'danger' },
  failed: { label: 'Fallido', color: 'danger' },
  active: { label: 'Activo', color: 'success' },
  // course roles
  student: { label: 'Estudiante', color: 'neutral' },
  teacher: { label: 'Profesor', color: 'primary' },
  admin: { label: 'Admin', color: 'secondary' },
}

// Builds `{ label, value }` options for DuiSelect from a list of STATUS keys.
export function statusOptions(keys: string[]) {
  return keys.map((value) => ({ value, label: STATUS[value]?.label ?? value }))
}

export const ORDER_STATUSES = statusOptions(['pending', 'paid', 'shipped', 'completed', 'canceled'])
export const PAYMENT_STATUSES = statusOptions(['pending', 'completed', 'failed'])
export const ENROLLMENT_STATUSES = statusOptions(['pending', 'active', 'completed', 'canceled'])
export const ENROLLMENT_ROLES = statusOptions(['student', 'teacher', 'admin'])
export const QUIZ_STATUSES = statusOptions(['pending', 'completed'])
