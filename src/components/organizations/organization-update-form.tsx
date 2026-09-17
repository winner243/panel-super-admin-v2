"use client"

import { useActionState } from "react"
import { Loader2 } from "lucide-react"
import { updateOrganizationAction } from "@/app/(DashboardLayout)/organizations/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { slugify } from "@/lib/slugify"
import type { ActionFormState } from "@/types/actions"

const initialState: ActionFormState = { status: "idle" }

export function OrganizationUpdateForm({
  organizationId,
  initialName,
  initialSlug,
}: {
  organizationId: string
  initialName: string
  initialSlug: string
}) {
  const [state, formAction, pending] = useActionState(updateOrganizationAction, initialState)

  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined

  return (
    <form action={formAction} className="grid gap-4" aria-busy={pending}>
      <input type="hidden" name="organizationId" value={organizationId} />

      {state.status === "error" ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.message ?? "Une erreur est survenue."}
        </p>
      ) : null}
      {state.status === "success" && state.message ? (
        <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-2">
        <Label htmlFor="org-update-name">Nom</Label>
        <Input
          id="org-update-name"
          name="name"
          type="text"
          defaultValue={initialName}
          maxLength={100}
          required
          disabled={pending}
          aria-invalid={Boolean(fieldErrors?.name)}
          aria-describedby={fieldErrors?.name ? "org-update-name-error" : undefined}
        />
        {fieldErrors?.name ? (
          <p id="org-update-name-error" className="text-sm text-destructive">
            {fieldErrors.name}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="org-update-slug">Slug</Label>
        <Input
          id="org-update-slug"
          name="slug"
          type="text"
          defaultValue={initialSlug}
          maxLength={100}
          required
          disabled={pending}
          aria-invalid={Boolean(fieldErrors?.slug)}
          aria-describedby={
            fieldErrors?.slug ? "org-update-slug-error" : "org-update-slug-hint"
          }
        />
        {fieldErrors?.slug ? (
          <p id="org-update-slug-error" className="text-sm text-destructive">
            {fieldErrors.slug}
          </p>
        ) : null}
        {!fieldErrors?.slug ? (
          <p id="org-update-slug-hint" className="text-xs text-muted-foreground">
            Exemple : {slugify(initialName)}
          </p>
        ) : null}
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
        {pending ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  )
}