export interface EmbeddedUser {
  id: string
  fullName: string
  avatar: string | null
}

export interface Enrollment {
  id: string
  siteId?: string
  userId?: string
  role: string
  createdAt?: string
}

export interface AuthUser {
  id: string
  fullName: string
  email: string
  avatar: string | null
  emailVerifiedAt?: string | null
}

export interface AuthResponse {
  user: AuthUser
  enrollment: Pick<Enrollment, 'id' | 'role'>
  token: string
}

export interface PaginationMeta {
  total: number
  perPage: number
  currentPage: number
  lastPage: number
  firstPage: number
  firstPageUrl: string
  lastPageUrl: string
  nextPageUrl: string | null
  previousPageUrl: string | null
}

export interface PaginatedResponse<T> {
  meta: PaginationMeta
  data: T[]
}

export interface Site {
  id: string
  name: string
  url: string
  description?: string | null
  logo?: string | null
  createdAt?: string
}

export interface PostAttribute {
  id: string
  contentPostId: string
  name: string
  value: string
}

export interface Post {
  id: string
  siteId?: string
  userId?: string
  slug: string
  name: string
  description: string
  tags: string[]
  picture: string | null
  content: string | null
  format: 'markdown' | 'html' | 'plaintext'
  active: boolean
  createdAt: string
  updatedAt: string
  user?: EmbeddedUser
  attributes?: PostAttribute[]
}

export interface Attachment {
  id: string
  siteId?: string
  userId?: string
  name: string
  path: string
  size: number
  mime: string
  createdAt: string
  url?: string
}

export interface Comment {
  id: string
  content: string
  commentableType?: string
  commentableId?: string
  parentId?: string | null
  isEdited: boolean
  active: boolean
  createdAt: string
  updatedAt?: string
  user: EmbeddedUser
  parent?: { id: string; content: string; user: EmbeddedUser } | null
  children?: { id: string; content: string; createdAt: string; user: EmbeddedUser }[]
}

export interface Topic {
  id: string
  slug: string
  name: string
  group?: string | null
  content: string
  active: boolean
  createdAt?: string
  updatedAt: string
  user: EmbeddedUser
}

export interface Reply {
  id: string
  topicId: string
  userId?: string
  content: string
  createdAt: string
  user: EmbeddedUser
}

// Store module types

export interface StoreProductAttribute {
  id: string
  productId: string
  name: string
  value: string
}

export interface StoreProduct {
  id: string
  siteId?: string
  slug: string
  name: string
  description: string | null
  content: string | null
  picture: string | null
  price: number
  stock: number
  tags: string[] | null
  sizeW: number | null
  sizeH: number | null
  sizeD: number | null
  weight: number | null
  active: boolean
  createdAt: string
  updatedAt: string
  attributes?: StoreProductAttribute[]
}

export interface StoreOrderItem {
  id: string
  orderId: string
  productId: string | null
  quantity: number
  price: number
  createdAt: string
  updatedAt: string
  product?: Pick<StoreProduct, 'id' | 'name' | 'slug' | 'picture'>
}

export interface StorePayment {
  id: string
  orderId: string
  paymentMethod: string
  paymentStatus: 'pending' | 'completed' | 'failed'
  transactionId: string | null
  amount: number
  currency: string
  createdAt: string
  updatedAt: string
  order?: StoreOrder
}

export interface StoreOrder {
  id: string
  siteId?: string
  userId: string | null
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'canceled'
  total: number
  shippingAddress: Record<string, any> | null
  billingAddress: Record<string, any> | null
  createdAt: string
  updatedAt: string
  user?: EmbeddedUser | null
  items?: StoreOrderItem[]
  payments?: StorePayment[]
}

export interface StoreCoupon {
  id: string
  siteId?: string
  code: string
  discount: number
  discountType: 'percentage' | 'fixed'
  minimumOrderValue: number | null
  expirationDate: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface StoreState {
  id: number
  name: string
  code: string
  country: string
}

export interface StoreCity {
  id: number
  name: string
  stateId: number
  state?: StoreState
}

export interface StoreShippingRule {
  id: string
  siteId?: string
  name: string
  stateId: number | null
  cityId: number | null
  price: number
  pricePerKg: number | null
  pricePerCm3: number | null
  active: boolean
  createdAt: string
  updatedAt: string
  state?: StoreState | null
  city?: StoreCity | null
}

// Learn module types

export interface LearnCourse {
  id: string
  siteId?: string
  slug: string
  name: string
  group: string | null
  description: string | null
  picture: string | null
  video: string | null
  autoEnroll: boolean
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface LearnLesson {
  id: string
  courseId: string
  slug: string
  name: string
  description: string | null
  format: 'text' | 'html' | 'markdown'
  content: string | null
  activity: string | null
  video: string | null
  order: number
  active: boolean
  limitDate: string | null
  createdAt: string
  updatedAt: string
}

export interface LearnQuestion {
  id: string
  courseId: string
  name: string
  description: string | null
  picture: string | null
  attachment: string | null
  response1: string
  response2: string
  response3: string | null
  response4: string | null
  response5: string | null
  responseCorrect: number
  wons: number
  losses: number
  difficulty: number
  createdAt: string
  updatedAt: string
}

export interface LearnLessonQuestion {
  id: string
  lessonId: string
  questionId: string
  question?: LearnQuestion
}

export interface LearnLessonAnswer {
  id: string
  lessonId: string
  learnEnrollmentId: string
  answer: string
  attachment: string | null
  feedback: string | null
  result: number | null
  createdAt: string
  updatedAt: string
  enrollment?: Pick<LearnEnrollment, 'id' | 'userId'> & { user?: EmbeddedUser }
}

export interface LearnLessonQuestionsQuiz {
  id: string
  lessonId: string
  learnEnrollmentId: string
  // Stored as JSON text in appi: may arrive as a string or already parsed
  questions: { id: string; name: string; response_correct: number }[] | string
  answers: { question_id: string; selected: number; correct: boolean }[] | string
  status: 'pending' | 'completed'
  results: number | null
  createdAt: string
  updatedAt: string
  enrollment?: Pick<LearnEnrollment, 'id' | 'userId'> & { user?: EmbeddedUser }
}

export interface LearnEnrollment {
  id: string
  courseId: string
  userId: string
  role: 'student' | 'teacher' | 'admin'
  status: 'pending' | 'active' | 'completed' | 'canceled'
  progress: number
  createdAt: string
  updatedAt: string
  user?: EmbeddedUser
  course?: Pick<LearnCourse, 'id' | 'name' | 'slug' | 'group'>
}

export interface SiteUser {
  id: string
  fullName: string | null
  email: string
}
