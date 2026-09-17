export interface AuthUser {
  id: string
  email: string
  fullName: string | null
  avatarUrl: string | null
}

export interface AuthCredentials {
  email: string
  password: string
}

export interface SignUpInput {
  email: string
  password: string
  fullName?: string
  emailRedirectTo?: string
}

export interface AuthFieldErrors {
  email?: string
  password?: string
  fullName?: string
}

export type AuthFormState =
  | { status: "idle" }
  | { status: "success"; message?: string }
  | { status: "error"; message?: string; fieldErrors?: AuthFieldErrors }

export interface AuthBanner {
  variant: "info" | "success" | "error"
  message: string
}