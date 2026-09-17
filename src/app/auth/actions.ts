"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { SupabaseAdminAuthAdapter } from "@/adapters/auth"
import { createServerSupabaseClient } from "@/infrastructure/supabase/server"
import { recordAuditLog } from "@/lib/audit-recorder"
import { createRateLimiter, AUTH_RATE_LIMIT_CONFIG } from "@/lib/rate-limit"
import { resolveSafeRedirect } from "@/lib/safe-redirect"
import { AdminAuthService } from "@/services/auth.service"
import type { AuthFormState } from "@/types/auth"
import { parseLoginInput, parseSignUpInput } from "@/validators/auth"

const loginRateLimiter = createRateLimiter<`login-${string}`>(AUTH_RATE_LIMIT_CONFIG)

export async function loginAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "")
  const password = String(formData.get("password") ?? "")
  const next = String(formData.get("next") ?? "")

  const parsed = parseLoginInput({ email, password })
  if (!parsed.success) {
    return {
      status: "error",
      message: "Vérifiez les champs du formulaire.",
      fieldErrors: {
        email: parsed.error.issues.some((issue) => issue.path[0] === "email")
          ? "Adresse e-mail invalide."
          : undefined,
        password: parsed.error.issues.some((issue) => issue.path[0] === "password")
          ? "Le mot de passe est requis."
          : undefined,
      },
    }
  }

  const ipKey = await getClientIpKey()
  const rateResult = loginRateLimiter.check(ipKey)
  if (!rateResult.allowed) {
    return {
      status: "error",
      message: "Trop de tentatives de connexion. Réessayez plus tard.",
    }
  }

  try {
    const supabase = await createServerSupabaseClient()
    const auth = new AdminAuthService(new SupabaseAdminAuthAdapter(supabase))
    await auth.signIn(parsed.data)
    await recordAuthEvent(supabase, auth, "auth.login")
  } catch (error) {
    return { status: "error", message: describeLoginFailure(error) }
  }

  loginRateLimiter.reset(ipKey)
  redirect(resolveSafeRedirect(next || undefined))
}

export async function signUpAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "")
  const password = String(formData.get("password") ?? "")
  const fullName = String(formData.get("fullName") ?? "")

  const parsed = parseSignUpInput({ email, password, fullName: fullName || undefined })
  if (!parsed.success) {
    return {
      status: "error",
      message: "Vérifiez les champs du formulaire.",
      fieldErrors: {
        email: parsed.error.issues.some((issue) => issue.path[0] === "email")
          ? "Adresse e-mail invalide."
          : undefined,
        password: parsed.error.issues.some((issue) => issue.path[0] === "password")
          ? "Le mot de passe doit contenir au moins 8 caractères."
          : undefined,
        fullName: parsed.error.issues.some((issue) => issue.path[0] === "fullName")
          ? "Le nom ne doit pas dépasser 120 caractères."
          : undefined,
      },
    }
  }

  try {
    const supabase = await createServerSupabaseClient()
    const auth = new AdminAuthService(new SupabaseAdminAuthAdapter(supabase))
    const emailRedirectTo = await buildEmailRedirectTo()
    const result = await auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      fullName: parsed.data.fullName,
      emailRedirectTo,
    })

    if (result.sessionCreated) {
      await recordAuthEvent(supabase, auth, "auth.signup")
      return {
        status: "success",
        message: "Compte créé. Vous pouvez vous connecter.",
      }
    }

    return {
      status: "success",
      message:
        "Compte créé. Confirmez votre adresse e-mail depuis le lien reçu avant de vous connecter.",
    }
  } catch (error) {
    return { status: "error", message: describeSignUpFailure(error) }
  }
}

export async function logoutAction(): Promise<void> {
  try {
    const supabase = await createServerSupabaseClient()
    const auth = new AdminAuthService(new SupabaseAdminAuthAdapter(supabase))
    await recordAuthEvent(supabase, auth, "auth.logout")
    await auth.signOut()
  } catch {
    // Déconnexion des cookies même si le serveur d'authentification est injoignable.
  }
  redirect("/auth/login")
}

/**
 * Journalise un événement d'authentification en best-effort à partir de la
 * session courante. Sans session (inscription avec confirmation e-mail,
 * échec de connexion), aucun événement n'est journalisé : éviter de stocker
 * des tentatives non authentifiées limite les données personnelles et le
 * risque d'usurpation.
 */
async function recordAuthEvent(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  auth: AdminAuthService,
  action: "auth.login" | "auth.signup" | "auth.logout",
): Promise<void> {
  const user = await auth.getUser()
  if (!user) return
  await recordAuditLog(supabase, {
    actorId: user.id,
    action,
    resourceType: "auth",
    resourceId: user.id,
  })
}

function describeLoginFailure(error: unknown): string {
  const detail = readErrorDetail(error)
  if (detail?.code === "email_not_confirmed") {
    return "Adresse e-mail non confirmée. Vérifiez votre boîte de réception."
  }
  return "Identifiants incorrects."
}

function describeSignUpFailure(error: unknown): string {
  const detail = readErrorDetail(error)
  if (detail?.code === "user_already_exists") {
    return "Un compte existe déjà avec cette adresse e-mail."
  }
  if (detail?.code === "over_email_send_rate_limit") {
    return "Trop de demandes. Réessayez plus tard."
  }
  return "L'inscription a échoué. Réessayez plus tard."
}

function readErrorDetail(error: unknown): { message: string; code?: string } | null {
  if (typeof error !== "object" || error === null) return null
  const candidate = error as { message?: unknown; code?: unknown }
  if (typeof candidate.message !== "string") return null
  return {
    message: candidate.message,
    code: typeof candidate.code === "string" ? candidate.code : undefined,
  }
}

async function getClientIpKey(): Promise<`login-${string}`> {
  const requestHeaders = await headers()
  const forwarded = requestHeaders.get("x-forwarded-for")
  const rawIp = forwarded ?? requestHeaders.get("x-real-ip") ?? "unknown"
  const ip = rawIp.split(",")[0]?.trim() || "unknown"
  return `login-${ip}`
}

async function buildEmailRedirectTo(): Promise<string | undefined> {
  const requestHeaders = await headers()
  const proto = requestHeaders.get("x-forwarded-proto") ?? "http"
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host")
  if (!host) return undefined
  return `${proto}://${host}/auth/callback`
}