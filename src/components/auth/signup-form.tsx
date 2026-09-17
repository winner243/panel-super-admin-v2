"use client"

import { useActionState } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { signUpAction } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { AuthFormState } from "@/types/auth"
import { AuthBanner } from "./auth-banner"

const initialState: AuthFormState = { status: "idle" }

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUpAction, initialState)

  if (state.status === "success") {
    return (
      <div className="grid gap-4">
        <AuthBanner
          variant="success"
          message={state.message ?? "Compte créé."}
        />
        <Button asChild className="w-full">
          <Link href="/auth/login">Aller à la connexion</Link>
        </Button>
      </div>
    )
  }

  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined

  return (
    <form action={formAction} className="grid gap-4" aria-busy={pending}>
      {state.status === "error" ? (
        <AuthBanner
          variant="error"
          message={state.message ?? "Une erreur est survenue."}
        />
      ) : null}

      <div className="grid gap-2">
        <Label htmlFor="signup-fullname">Nom complet</Label>
        <Input
          id="signup-fullname"
          name="fullName"
          type="text"
          autoComplete="name"
          placeholder="Marie Dupont"
          maxLength={120}
          disabled={pending}
          aria-invalid={Boolean(fieldErrors?.fullName)}
          aria-describedby={fieldErrors?.fullName ? "signup-fullname-error" : undefined}
        />
        {fieldErrors?.fullName ? (
          <p id="signup-fullname-error" className="text-sm text-destructive">
            {fieldErrors?.fullName}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="signup-email">Adresse e-mail</Label>
        <Input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="vous@exemple.com"
          required
          disabled={pending}
          aria-invalid={Boolean(fieldErrors?.email)}
          aria-describedby={fieldErrors?.email ? "signup-email-error" : undefined}
        />
        {fieldErrors?.email ? (
          <p id="signup-email-error" className="text-sm text-destructive">
            {fieldErrors?.email}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="signup-password">Mot de passe</Label>
        <Input
          id="signup-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={72}
          disabled={pending}
          aria-invalid={Boolean(fieldErrors?.password)}
          aria-describedby={fieldErrors?.password ? "signup-password-error" : undefined}
        />
        {fieldErrors?.password ? (
          <p id="signup-password-error" className="text-sm text-destructive">
            {fieldErrors?.password}
          </p>
        ) : null}
      </div>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        {pending ? "Création du compte…" : "Créer un compte"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Déjà un compte ?{" "}
        <Link href="/auth/login" className="font-medium underline underline-offset-4">
          Se connecter
        </Link>
      </p>
    </form>
  )
}