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

export interface PostFormData {
  name: string
  description: string
  tags: string[]
  picture: string | null
  content: string | null
  format: string
  active: boolean
}
