import { redirect } from "next/navigation"
import { SupabaseAdminAuthAdapter } from "@/adapters/auth"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { createServerSupabaseClient } from "@/infrastructure/supabase/server"
import { AdminAuthService } from "@/services/auth.service"
import type { AuthUser } from "@/types/auth"

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  let user: AuthUser | null = null

  try {
    const supabase = await createServerSupabaseClient()
    user = await new AdminAuthService(new SupabaseAdminAuthAdapter(supabase)).getUser()
  } catch {
    redirect("/auth/login?reason=session_expired")
  }

  if (!user) {
    redirect("/auth/login?reason=unauthenticated")
  }

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <Header user={user} />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 lg:px-8">{children}</main>
      </div>
    </div>
  )
}