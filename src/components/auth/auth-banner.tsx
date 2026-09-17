import type { AuthBanner as AuthBannerProps } from "@/types/auth"

export function AuthBanner({ variant, message }: AuthBannerProps) {
  const styles =
    variant === "error"
      ? "border-destructive/30 bg-destructive/10 text-destructive"
      : variant === "success"
        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
        : "border-border bg-muted text-muted-foreground"

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`rounded-md border px-3 py-2 text-sm ${styles}`}>
      {message}
    </div>
  )
}