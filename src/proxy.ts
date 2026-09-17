import { NextResponse, type NextRequest } from "next/server"
import { updateSession } from "@/infrastructure/supabase/middleware"
import { isPublicAuthPath, requiresAuthentication } from "@/lib/route-guard"

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const { supabaseResponse, authenticated, authError } = await updateSession(request)

  if (authenticated && isPublicAuthPath(pathname)) {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = "/"
    dashboardUrl.search = ""
    return NextResponse.redirect(dashboardUrl)
  }

  if (!authenticated && requiresAuthentication(pathname)) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/auth/login"
    loginUrl.searchParams.set("reason", authError ? "session_expired" : "unauthenticated")
    if (!authError) {
      loginUrl.searchParams.set("next", pathname)
    }
    return NextResponse.redirect(loginUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)",
  ],
}