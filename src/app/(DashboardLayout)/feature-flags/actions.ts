"use server"

import { z } from "zod"
import { SupabaseAdminAuthAdapter } from "@/adapters/auth"
import { createServerSupabaseClient } from "@/infrastructure/supabase/server"
import { recordAuditLog } from "@/lib/audit-recorder"
import { SupabaseFeatureFlagRepository } from "@/repositories/feature-flag.repository"
import { AdminAuthService } from "@/services/auth.service"
import { FeatureFlagService } from "@/services/feature-flag.service"
import type { ActionFieldErrors, ActionFormState } from "@/types/actions"
import { createFeatureFlagSchema } from "@/validators/feature-flag"

export async function createFeatureFlagAction(
  _previousState: ActionFormState,
  formData: FormData,
): Promise<ActionFormState> {
  const key = String(formData.get("key") ?? "")
  const name = String(formData.get("name") ?? "")
  const description = String(formData.get("description") ?? "")

  const { supabase, user } = await getSessionContext()
  if (!user) {
    return { status: "error", message: "Votre session a expire. Reconnectez-vous." }
  }

  const parsed = createFeatureFlagSchema.safeParse({
    key,
    name,
    description: description || null,
    enabled: false,
    scope: "global",
  })
  if (!parsed.success) {
    return {
      status: "error",
      message: "Verifiez les champs du formulaire.",
      fieldErrors: mapFeatureFlagFieldErrors(parsed.error),
    }
  }

  try {
    const service = new FeatureFlagService(new SupabaseFeatureFlagRepository(supabase))
    await service.create(parsed.data)

    await recordAuditLog(supabase, {
      actorId: user.id,
      action: "feature_flags.create",
      resourceType: "feature_flag",
      metadata: { key: parsed.data.key, name: parsed.data.name },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "L operation a echoue."
    return { status: "error", message }
  }

  return { status: "success", message: "Feature flag cree." }
}

export async function toggleFeatureFlagAction(
  _previousState: ActionFormState,
  formData: FormData,
): Promise<ActionFormState> {
  const flagId = String(formData.get("flagId") ?? "")
  const enabled = formData.get("enabled") === "true"

  const { supabase, user } = await getSessionContext()
  if (!user) {
    return { status: "error", message: "Votre session a expire. Reconnectez-vous." }
  }

  if (!flagId) {
    return { status: "error", message: "ID du flag manquant." }
  }

  try {
    const service = new FeatureFlagService(new SupabaseFeatureFlagRepository(supabase))
    await service.update(flagId, { enabled: !enabled })

    await recordAuditLog(supabase, {
      actorId: user.id,
      action: "feature_flags.toggle",
      resourceType: "feature_flag",
      resourceId: flagId,
      metadata: { enabled: !enabled },
    })
  } catch {
    return { status: "error", message: "La modification a echoue." }
  }

  return { status: "success", message: enabled ? "Flag desactive." : "Flag active." }
}

async function getSessionContext() {
  const supabase = await createServerSupabaseClient()
  const auth = new AdminAuthService(new SupabaseAdminAuthAdapter(supabase))
  const user = await auth.getUser()
  return { supabase, user }
}

function mapFeatureFlagFieldErrors(error: z.ZodError): ActionFieldErrors {
  const keyInvalid = error.issues.some((issue) => issue.path[0] === "key")
  const nameInvalid = error.issues.some((issue) => issue.path[0] === "name")

  return {
    key: keyInvalid ? "Cle invalide : minuscules, chiffres et tirets uniquement." : undefined,
    name: nameInvalid ? "Le nom doit contenir entre 1 et 100 caracteres." : undefined,
  }
}
