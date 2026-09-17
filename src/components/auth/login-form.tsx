"use client"

import { useActionState } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { loginAction } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { AuthBanner, AuthFormState } from "@/types/auth"
import { AuthBanner as AuthBannerView } from "./auth-banner"

const initialState: AuthFormState = { status: "idle" }

export function LoginForm({
  initialNext,
  initialBanner,
}: {
  initialNext?: string
  initialBanner?: AuthBanner | null
}) {
  const [state, formAction, pending] = useActionState(loginAction, initialState)

  const banner: AuthBanner | null =
    state.status === "error"
      ? { variant: "error", message: state.message ?? "Une erreur est survenue." }
      : initialBanner ?? null

  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined

  return (
    <form action={formAction} className="grid gap-4" aria-busy={pending}>
      {banner ? <AuthBannerView variant={banner.variant} message={banner.message} /> : null}

      <div className="grid gap-2">
        <Label htmlFor="login-email">Adresse e-mail</Label>
        <Input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="vous@exemple.com"
          autoFocus
          required
          disabled={pending}
          aria-invalid={Boolean(fieldErrors?.email)}
          aria-describedby={fieldErrors?.email ? "login-email-error" : undefined}
        />
        {fieldErrors?.email ? (
          <p id="login-email-error" className="text-sm text-destructive">
            {fieldErrors?.email}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="login-password">Mot de passe</Label>
        <Input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={pending}
          aria-invalid={Boolean(fieldErrors?.password)}
          aria-describedby={fieldErrors?.password ? "login-password-error" : undefined}
        />
        {fieldErrors?.password ? (
          <p id="login-password-error" className="text-sm text-destructive">
            {fieldErrors?.password}
          </p>
        ) : null}
      </div>

      <input type="hidden" name="next" value={initialNext ?? ""} />

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        {pending ? "Connexion en cours…" : "Se connecter"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Pas encore de compte ?{" "}
        <Link href="/auth/register" className="font-medium underline underline-offset-4">
          Créer un compte
        </Link>
      </p>
    </form>
  )
}