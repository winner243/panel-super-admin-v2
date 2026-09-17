export const AUTH_PATHS = ["/auth/login", "/auth/register", "/auth/callback"]

export function isPublicAuthPath(pathname: string): boolean {
  return AUTH_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  )
}

export function requiresAuthentication(pathname: string): boolean {
  if (pathname === "/_not-found" || pathname.startsWith("/_next")) return false
  if (/^\/.*\.(?:png|jpg|jpeg|gif|svg|webp|ico|txt)$/i.test(pathname)) return false
  return !isPublicAuthPath(pathname)
}