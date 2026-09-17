import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/infrastructure/supabase/database"
import type { AuthCredentials, AuthUser, SignUpInput } from "@/types/auth"

type SupabaseAuthUser = {
  id: string
  email?: string | null
  user_metadata?: Record<string, unknown>
}

export interface AdminAuthAdapter {
  signIn(credentials: AuthCredentials): Promise<AuthUser>
  signUp(input: SignUpInput): Promise<{ user: AuthUser | null; sessionCreated: boolean }>
  signOut(): Promise<void>
  getUser(): Promise<AuthUser | null>
}

export class SupabaseAdminAuthAdapter implements AdminAuthAdapter {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async signIn(credentials: AuthCredentials): Promise<AuthUser> {
    const { data, error } = await this.client.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    })

    if (error) throw error
    if (!data.user) throw new Error("Aucun utilisateur retourné.")

    return mapAuthUser(data.user)
  }

  async signUp(input: SignUpInput): Promise<{ user: AuthUser | null; sessionCreated: boolean }> {
    const { data, error } = await this.client.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: { full_name: input.fullName },
        ...(input.emailRedirectTo ? { emailRedirectTo: input.emailRedirectTo } : {}),
      },
    })

    if (error) throw error

    return {
      user: data.user ? mapAuthUser(data.user) : null,
      sessionCreated: Boolean(data.session),
    }
  }

  async signOut(): Promise<void> {
    const { error } = await this.client.auth.signOut()
    if (error) throw error
  }

  async getUser(): Promise<AuthUser | null> {
    const { data, error } = await this.client.auth.getUser()
    if (error || !data.user) return null
    return mapAuthUser(data.user)
  }
}

export function mapAuthUser(user: SupabaseAuthUser): AuthUser {
  const metadata = user.user_metadata
  return {
    id: user.id,
    email: user.email ?? "",
    fullName: readMetadataString(metadata, "full_name"),
    avatarUrl: readMetadataString(metadata, "avatar_url"),
  }
}

function readMetadataString(
  metadata: Record<string, unknown> | undefined,
  key: string,
): string | null {
  const value = metadata?.[key]
  return typeof value === "string" && value.length > 0 ? value : null
}