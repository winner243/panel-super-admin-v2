export function isSafeRedirectPath(value: string): boolean {
  if (!value.startsWith("/")) return false
  if (value.startsWith("//")) return false
  if (value.includes(":") || value.includes("\\")) return false
  return true
}

export function resolveSafeRedirect(
  value: string | null | undefined,
  fallback = "/",
): string {
  return value && isSafeRedirectPath(value) ? value : fallback
}