import type { AdminAuthAdapter } from "@/adapters/auth"
import type { AuthCredentials, AuthUser, SignUpInput } from "@/types/auth"

export class AdminAuthService {
  constructor(private readonly adapter: AdminAuthAdapter) {}

  async signIn(credentials: AuthCredentials): Promise<AuthUser> {
    return this.adapter.signIn(credentials)
  }

  async signUp(input: SignUpInput): Promise<{ user: AuthUser | null; sessionCreated: boolean }> {
    return this.adapter.signUp(input)
  }

  async signOut(): Promise<void> {
    return this.adapter.signOut()
  }

  async getUser(): Promise<AuthUser | null> {
    return this.adapter.getUser().catch(() => null)
  }
}