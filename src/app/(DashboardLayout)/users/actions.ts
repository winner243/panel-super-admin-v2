"use server"

import { SupabaseAdminAuthAdapter } from "@/adapters/auth"
import { createServerSupabaseClient } from "@/infrastructure/supabase/server"
import { recordAuditLog } from "@/lib/audit-recorder"
import { createRateLimiter, type RateLimitConfig } from "@/lib/rate-limit"
import { getClientIpKey } from "@/lib/request-ip"
import { SupabaseProfileRepository } from "@/repositories/profile.repository"
import { AdminAuthService } from "@/services/auth.service"
import { ProfileService } from "@/services/profile.service"
import type { ActionFormState } from "@/types/actions"
import { updateProfileSchema } from "@/validators/profile"

const PROFILE_MUTATION_RATE_LIMIT: RateLimitConfig = {
  windowMs: 15 * 60 * 1000,
  maxAttempts: 20,
  lockDurationMs: 15 * 60 * 1000,
}

const profileMutationLimiter = createRateLimiter<string>(PROFILE_MUTATION_RATE_LIMIT)

export async function updateProfileAction(
  _previousState: ActionFormState,
  formData: FormData,
): Promise<ActionFormState> {
  const ipKey = await getClientIpKey("profile-update")
  if (!profileMutationLimiter.check(ipKey).allowed) {
    return { status: "error", message: "Trop de demandes. Réessayez plus tard." }
  }

  const fullName = String(formData.get("fullName") ?? "")

  const { supabase, user } = await getSessionContext()
  if (!user) {
    return { status: "error", message: "Votre session a expiré. Reconnectez-vous." }
  }

  const parsed = updateProfileSchema.safeParse({ fullName, avatarUrl: undefined })
  if (!parsed.success) {
    return {
      status: "error",
      message: "Vérifiez les champs du formulaire.",
      fieldErrors: { fullName: "Le nom doit contenir entre 1 et 120 caractères." },
    }
  }

  try {
    const profiles = new ProfileService(new SupabaseProfileRepository(supabase))
    await profiles.update(user.id, parsed.data)

    const { error: metaError } = await supabase.auth.updateUser({
      data: { full_name: parsed.data.fullName ?? null },
    })
    if (metaError) throw metaError

    await recordAuditLog(supabase, {
      actorId: user.id,
      action: "profile.update",
      resourceType: "profile",
      resourceId: user.id,
      metadata: { field: "full_name" },
    })
  } catch {
    return {
      status: "error",
      message: "La mise à jour du profil a échoué. Réessayez plus tard.",
    }
  }

  return { status: "success", message: "Profil mis à jour." }
}

async function getSessionContext() {
  const supabase = await createServerSupabaseClient()
  const auth = new AdminAuthService(new SupabaseAdminAuthAdapter(supabase))
  const user = await auth.getUser()
  return { supabase, user }
}