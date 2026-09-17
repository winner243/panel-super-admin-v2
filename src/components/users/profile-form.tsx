"use client"

import { useActionState } from "react"
import { Loader2 } from "lucide-react"
import { updateProfileAction } from "@/app/(DashboardLayout)/users/actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ActionFormState } from "@/types/actions"

const initialState: ActionFormState = { status: "idle" }

export function ProfileForm({
  email,
  initialFullName,
  avatarUrl,
  disabled,
}: {
  email: string
  initialFullName: string | null
  avatarUrl: string | null
  disabled?: boolean
}) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState)

  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined
  const displayName = initialFullName ?? email
  const initial = displayName.charAt(0).toUpperCase() || "U"

  return (
    <form action={formAction} className="grid gap-4" aria-busy={pending}>
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

      <div className="flex items-center gap-4">
        <Avatar className="size-14">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt="Photo de profil" /> : null}
          <AvatarFallback className="text-base font-semibold">{initial}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate font-medium">{initialFullName ?? "—"}</p>
          <p className="truncate text-sm text-muted-foreground">{email}</p>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="profile-email">Adresse e-mail</Label>
        <Input
          id="profile-email"
          type="email"
          value={email}
          readOnly
          disabled
          aria-describedby="profile-email-hint"
        />
        <p id="profile-email-hint" className="text-xs text-muted-foreground">
          L’adresse e-mail ne peut pas être modifiée depuis ce panneau.
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="profile-fullname">Nom complet</Label>
        <Input
          id="profile-fullname"
          name="fullName"
          type="text"
          autoComplete="name"
          placeholder="Marie Dupont"
          defaultValue={initialFullName ?? ""}
          maxLength={120}
          disabled={disabled || pending}
          aria-invalid={Boolean(fieldErrors?.fullName)}
          aria-describedby={fieldErrors?.fullName ? "profile-fullname-error" : undefined}
        />
        {fieldErrors?.fullName ? (
          <p id="profile-fullname-error" className="text-sm text-destructive">
            {fieldErrors.fullName}
          </p>
        ) : null}
      </div>

      <Button type="submit" disabled={disabled || pending}>
        {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
        {pending ? "Enregistrement…" : "Enregistrer"}
      </Button>

      {disabled ? (
        <p className="text-sm text-muted-foreground">
          Votre profil n’est pas encore initialisé. Reconnectez-vous pour le synchroniser.
        </p>
      ) : null}
    </form>
  )
}