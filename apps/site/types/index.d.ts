
export {};
declare global {
  export interface AppiToken {
    type: string
    name: string
    token: string
    abilities: string[]
    lastUsedAt: string
    expiresAt: string
  }
  export interface Me {
    user: User
    enrollment: Enrollment
  }
  
  export interface Enrollment {
    id: number
    siteId: string
    userId: string
    role: string
    created_at: string
    updatedAt: string
    site: Site
  }
  
  export interface Site {
    id: string
    name: string
    domain: string
    description: string
    logo: string | null
    props?: Prop[]
    created_at: string
    updatedAt: string
  }

  export interface Pagination<T extends Iterable<unknown>> {
    data: T
    current_page: number
    from: number
    last_page: number
    per_page: number
    to: number
    total: number
  }

  export interface Prop {
    name: string,
    value: string
  }

  export interface Comment {
    id: number
    site_id: string
    commentable_type: string
    commentable_id: string
    user_id: string
    parent_id: string | null
    content: string
    approved_at: string
    created_at: string
    updated_at: string
    user: User
    children: Comment[]
  }

  /* New */
  export interface Post {
    id: string
    userId: string
    siteId: string
    slug: string
    name: string
    description: string | null
    picture: string | null
    content: string | null
    format: string
    active: boolean
    createdAt: string
    updatedAt: string
    user: User
    attributes?: Attr[]
  }

  export interface Category {
    id: number
    site_id: string
    slug: string
    name: string
    description: string
    picture?: string
    created_at: string
    updated_at: string
  }

  export interface User {
    id: string
    name?: string
    fullName?: string
    email: string
    avatar?: string
    picture?: string
    created_at: string
    updated_at: string
  }

  export interface Attr {
    id: string
    contentPostId: string
    name: string
    type: string
    value: string
  }

  export interface Login {
    user: User
    token: string
    enrollment: Enrollment
  }
  
  export interface Token {
    accessToken: AccessToken
    plainTextToken: string
  }
  
  export interface AccessToken {
    name: string
    abilities: string[]
    expires_at: Date | null
    tokenable_id: string
    tokenable_type: string
    updated_at: string
    created_at: string
    id: number
  }

  export interface Window {
    require: unknown
    monaco: unknown
  }

  export interface Toast {
    show: boolean
    message: string
    color: string,
    duration: number,
  }

  export interface Submission {
    id: string
    code: string
    complete: boolean
    complete_time: string
    votes: number
    rank: string
    created_at: string
    userId: string
    challengeId: string
    user?: User
  }
  
}