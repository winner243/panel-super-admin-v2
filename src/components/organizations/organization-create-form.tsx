"use client"

import { useActionState, useState } from "react"
import { Loader2 } from "lucide-react"
import { createOrganizationAction } from "@/app/(DashboardLayout)/organizations/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { slugify } from "@/lib/slugify"
import type { ActionFormState } from "@/types/actions"

const initialState: ActionFormState = { status: "idle" }

export function OrganizationCreateForm() {
  const [state, formAction, pending] = useActionState(createOrganizationAction, initialState)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [slugEdited, setSlugEdited] = useState(false)

  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined
  const preview = slug || slugify(name)

  function handleNameChange(value: string) {
    setName(value)
    if (!slugEdited) setSlug(slugify(value))
  }

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
        <Label htmlFor="org-name">Nom de l’organisation</Label>
        <Input
          id="org-name"
          name="name"
          type="text"
          placeholder="Acme Corp"
          maxLength={100}
          required
          disabled={pending}
          value={name}
          onChange={(event) => handleNameChange(event.target.value)}
          aria-invalid={Boolean(fieldErrors?.name)}
          aria-describedby={fieldErrors?.name ? "org-name-error" : undefined}
        />
        {fieldErrors?.name ? (
          <p id="org-name-error" className="text-sm text-destructive">
            {fieldErrors.name}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="org-slug">Slug</Label>
        <Input
          id="org-slug"
          name="slug"
          type="text"
          placeholder="acme-corp"
          maxLength={100}
          required
          disabled={pending}
          value={slug}
          onChange={(event) => {
            setSlugEdited(true)
            setSlug(event.target.value)
          }}
          aria-invalid={Boolean(fieldErrors?.slug)}
          aria-describedby={
            fieldErrors?.slug ? "org-slug-error" : preview ? "org-slug-hint" : undefined
          }
        />
        {fieldErrors?.slug ? (
          <p id="org-slug-error" className="text-sm text-destructive">
            {fieldErrors.slug}
          </p>
        ) : null}
        {!fieldErrors?.slug && preview ? (
          <p id="org-slug-hint" className="text-xs text-muted-foreground">
            Identifiant lisible utilisé dans l’URL : {preview}
          </p>
        ) : null}
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
        {pending ? "Création…" : "Créer l’organisation"}
      </Button>
    </form>
  )
}