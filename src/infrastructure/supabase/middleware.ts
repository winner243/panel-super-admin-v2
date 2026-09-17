import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import type { Database } from "./database"

export interface SessionCheck {
  supabaseResponse: NextResponse
  authenticated: boolean
  authError: boolean
}

export async function updateSession(request: NextRequest): Promise<SessionCheck> {
  let supabaseResponse = NextResponse.next({ request })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    return { supabaseResponse, authenticated: false, authError: true }
  }

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value)
        })
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, {
            ...options,
            path: "/",
            sameSite: "lax",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
          })
        })
      },
    },
  })

  const { data, error } = await supabase.auth.getUser()

  return {
    supabaseResponse,
    authenticated: Boolean(data.user),
    authError: Boolean(error),
  }
}