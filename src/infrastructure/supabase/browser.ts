import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "./database"
import { requireEnv } from "./env"

export function createBrowserSupabaseClient() {
  const { url, anonKey } = requireEnv()
  return createBrowserClient<Database>(url, anonKey)
}