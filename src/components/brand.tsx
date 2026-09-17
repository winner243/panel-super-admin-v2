import { ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

export function Brand({
  className,
  compact = false,
}: {
  className?: string
  compact?: boolean
}) {
  return (
    <div className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
        <ShieldCheck className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 leading-tight">
        <p className="truncate text-base font-semibold tracking-tight">Super Admin</p>
        {!compact ? (
          <p className="truncate text-xs text-muted-foreground">Panel de supervision</p>
        ) : null}
      </div>
    </div>
  )
}