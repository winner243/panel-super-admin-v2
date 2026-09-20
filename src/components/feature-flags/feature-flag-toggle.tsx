"use client"

import { useActionState } from "react"
import { Loader2 } from "lucide-react"
import { toggleFeatureFlagAction } from "@/app/(DashboardLayout)/feature-flags/actions"
import { Button } from "@/components/ui/button"
import type { ActionFormState } from "@/types/actions"

const initialState: ActionFormState = { status: "idle" }

export function FeatureFlagToggle({
  flagId,
  initialEnabled,
}: {
  flagId: string
  initialEnabled: boolean
}) {
  const [state, formAction, pending] = useActionState(toggleFeatureFlagAction, initialState)

  const currentEnabled =
    state.status === "success"
      ? !initialEnabled
      : initialEnabled

  return (
    <form action={formAction}>
      <input type="hidden" name="flagId" value={flagId} />
      <input type="hidden" name="enabled" value={String(currentEnabled)} />
      <Button
        type="submit"
        variant={currentEnabled ? "default" : "outline"}
        size="sm"
        disabled={pending}>
        {pending ? <Loader2 className="size-3 animate-spin" aria-hidden="true" /> : null}
        {currentEnabled ? "Actif" : "Inactif"}
      </Button>
    </form>
  )
}
