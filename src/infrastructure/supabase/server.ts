import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "./database"
import { requireEnv } from "./env"

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  const { url, anonKey } = requireEnv()

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, {
              ...options,
              path: "/",
              sameSite: "lax",
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
            }),
          )
        } catch {
          // Mutation ignorée pendant le rendu d'un Server Component : le rafraîchissement de session est géré par le middleware.
        }
      },
    },
  })
}