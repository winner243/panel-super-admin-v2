"use client"

import { useActionState } from "react"
import { Loader2 } from "lucide-react"
import { createFeatureFlagAction } from "@/app/(DashboardLayout)/feature-flags/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ActionFormState } from "@/types/actions"

const initialState: ActionFormState = { status: "idle" }

export function FeatureFlagCreateForm() {
  const [state, formAction, pending] = useActionState(createFeatureFlagAction, initialState)

  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined

  return (
    <form action={formAction} className="grid gap-4" aria-busy={pending}>
      {state.status === "error" ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.message ?? "Une erreur est survenue."}
        </p>
      ) : null}

      <div className="grid gap-2">
        <Label htmlFor="ff-key">Cle</Label>
        <Input
          id="ff-key"
          name="key"
          type="text"
          placeholder="mon-feature"
          maxLength={100}
          required
          disabled={pending}
          aria-invalid={Boolean(fieldErrors?.key)}
          aria-describedby={fieldErrors?.key ? "ff-key-error" : undefined}
        />
        {fieldErrors?.key ? (
          <p id="ff-key-error" className="text-sm text-destructive">
            {fieldErrors.key}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="ff-name">Nom</Label>
        <Input
          id="ff-name"
          name="name"
          type="text"
          placeholder="Mon Feature"
          maxLength={100}
          required
          disabled={pending}
          aria-invalid={Boolean(fieldErrors?.name)}
          aria-describedby={fieldErrors?.name ? "ff-name-error" : undefined}
        />
        {fieldErrors?.name ? (
          <p id="ff-name-error" className="text-sm text-destructive">
            {fieldErrors.name}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="ff-description">Description (optionnel)</Label>
        <Input
          id="ff-description"
          name="description"
          type="text"
          placeholder="Description du feature flag"
          maxLength={500}
          disabled={pending}
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
        {pending ? "Creation..." : "Creer le flag"}
      </Button>
    </form>
  )
}
