"use server"

import { redirect } from "next/navigation"
import { z } from "zod"
import { SupabaseAdminAuthAdapter } from "@/adapters/auth"
import { createServerSupabaseClient } from "@/infrastructure/supabase/server"
import { recordAuditLog } from "@/lib/audit-recorder"
import { createRateLimiter, type RateLimitConfig } from "@/lib/rate-limit"
import { getClientIpKey } from "@/lib/request-ip"
import { SupabaseOrganizationMemberRepository } from "@/repositories/organization-member.repository"
import { SupabaseOrganizationRepository } from "@/repositories/organization.repository"
import { SupabaseRoleRepository } from "@/repositories/role.repository"
import { AdminAuthService } from "@/services/auth.service"
import { OrganizationMemberService } from "@/services/organization-member.service"
import { OrganizationService } from "@/services/organization.service"
import type { ActionFieldErrors, ActionFormState } from "@/types/actions"
import { changeMemberRoleSchema } from "@/validators/organization-member"
import { createOrganizationSchema, updateOrganizationSchema } from "@/validators/organization"

const ORG_MUTATION_RATE_LIMIT: RateLimitConfig = {
  windowMs: 15 * 60 * 1000,
  maxAttempts: 30,
  lockDurationMs: 15 * 60 * 1000,
}

const orgMutationLimiter = createRateLimiter<string>(ORG_MUTATION_RATE_LIMIT)

const memberTargetSchema = z.object({
  organizationId: z.uuid(),
  userId: z.uuid(),
})

export async function createOrganizationAction(
  _previousState: ActionFormState,
  formData: FormData,
): Promise<ActionFormState> {
  const ipKey = await getClientIpKey("org-create")
  if (!orgMutationLimiter.check(ipKey).allowed) {
    return { status: "error", message: "Trop de demandes. Réessayez plus tard." }
  }

  const name = String(formData.get("name") ?? "")
  const slug = String(formData.get("slug") ?? "")

  const { supabase, user } = await getSessionContext()
  if (!user) {
    return { status: "error", message: "Votre session a expiré. Reconnectez-vous." }
  }

  const parsed = createOrganizationSchema.safeParse({ name, slug, createdBy: user.id })
  if (!parsed.success) {
    return {
      status: "error",
      message: "Vérifiez les champs du formulaire.",
      fieldErrors: mapOrganizationFieldErrors(parsed.error),
    }
  }

  let createdId: string | null = null
  try {
    const organizations = new OrganizationService(new SupabaseOrganizationRepository(supabase))
    const members = new OrganizationMemberService(
      new SupabaseOrganizationMemberRepository(supabase),
    )
    const roles = await new SupabaseRoleRepository(supabase).list()
    const ownerRole = roles.find((role) => role.name === "owner")
    if (!ownerRole) throw new Error("Rôle propriétaire introuvable.")

    const organization = await organizations.create(parsed.data)
    await members.add({
      organizationId: organization.id,
      userId: user.id,
      roleId: ownerRole.id,
    })
    createdId = organization.id
    await recordAuditLog(supabase, {
      actorId: user.id,
      organizationId: organization.id,
      action: "organizations.create",
      resourceType: "organization",
      resourceId: organization.id,
      metadata: { role: "owner" },
    })
  } catch (error) {
    return { status: "error", message: describeOrgMutationFailure(error) }
  }

  orgMutationLimiter.reset(ipKey)
  redirect(`/organizations/${createdId}`)
}

export async function updateOrganizationAction(
  _previousState: ActionFormState,
  formData: FormData,
): Promise<ActionFormState> {
  const ipKey = await getClientIpKey("org-update")
  if (!orgMutationLimiter.check(ipKey).allowed) {
    return { status: "error", message: "Trop de demandes. Réessayez plus tard." }
  }

  const organizationId = String(formData.get("organizationId") ?? "")
  const name = String(formData.get("name") ?? "")
  const slug = String(formData.get("slug") ?? "")

  const { supabase, user } = await getSessionContext()
  if (!user) {
    return { status: "error", message: "Votre session a expiré. Reconnectez-vous." }
  }

  const parsed = updateOrganizationSchema.safeParse({ name, slug })
  if (!parsed.success) {
    return {
      status: "error",
      message: "Vérifiez les champs du formulaire.",
      fieldErrors: mapOrganizationFieldErrors(parsed.error),
    }
  }
  if (parsed.data.name === undefined && parsed.data.slug === undefined) {
    return { status: "error", message: "Au moins un champ doit être fourni." }
  }

  try {
    const organizations = new OrganizationService(new SupabaseOrganizationRepository(supabase))
    await organizations.update(organizationId, parsed.data)

    const changedFields: string[] = []
    if (parsed.data.name !== undefined) changedFields.push("name")
    if (parsed.data.slug !== undefined) changedFields.push("slug")

    await recordAuditLog(supabase, {
      actorId: user.id,
      organizationId,
      action: "organizations.update",
      resourceType: "organization",
      resourceId: organizationId,
      metadata: { fields: changedFields.join(",") },
    })
  } catch (error) {
    return { status: "error", message: describeOrgMutationFailure(error) }
  }

  orgMutationLimiter.reset(ipKey)
  return { status: "success", message: "Organisation mise à jour." }
}

export async function changeMemberRoleAction(
  _previousState: ActionFormState,
  formData: FormData,
): Promise<ActionFormState> {
  const ipKey = await getClientIpKey("member-role")
  if (!orgMutationLimiter.check(ipKey).allowed) {
    return { status: "error", message: "Trop de demandes. Réessayez plus tard." }
  }

  const organizationId = String(formData.get("organizationId") ?? "")
  const userId = String(formData.get("userId") ?? "")
  const roleId = String(formData.get("roleId") ?? "")

  const { supabase, user } = await getSessionContext()
  if (!user) {
    return { status: "error", message: "Votre session a expiré. Reconnectez-vous." }
  }

  const target = memberTargetSchema.safeParse({ organizationId, userId })
  const role = changeMemberRoleSchema.safeParse({ roleId })
  if (!target.success || !role.success) {
    return { status: "error", message: "Les données du formulaire sont invalides." }
  }

  try {
    const members = new OrganizationMemberService(
      new SupabaseOrganizationMemberRepository(supabase),
    )
    const detail = await members.listByOrganizationWithDetails(organizationId)
    const member = detail.find((entry) => entry.userId === userId)
    if (!member) {
      return { status: "error", message: "Ce membre n'est pas présent dans l'organisation." }
    }
    if (member.roleId === roleId) {
      return { status: "success", message: "Rôle déjà en vigueur." }
    }

    const owners = detail.filter((entry) => entry.roleName === "owner")
    if (member.roleName === "owner" && owners.length <= 1) {
      return { status: "error", message: "Impossible de rétrograder le dernier propriétaire." }
    }

    await members.changeRole(organizationId, userId, { roleId })

    await recordAuditLog(supabase, {
      actorId: user.id,
      organizationId,
      action: "members.rolechange",
      resourceType: "member",
      resourceId: userId,
      metadata: { fromRoleId: member.roleId, toRoleId: roleId },
    })
  } catch (error) {
    return { status: "error", message: describeOrgMutationFailure(error) }
  }

  orgMutationLimiter.reset(ipKey)
  return { status: "success", message: "Rôle du membre mis à jour." }
}

export async function removeMemberAction(
  _previousState: ActionFormState,
  formData: FormData,
): Promise<ActionFormState> {
  const ipKey = await getClientIpKey("member-remove")
  if (!orgMutationLimiter.check(ipKey).allowed) {
    return { status: "error", message: "Trop de demandes. Réessayez plus tard." }
  }

  const organizationId = String(formData.get("organizationId") ?? "")
  const userId = String(formData.get("userId") ?? "")

  const { supabase, user } = await getSessionContext()
  if (!user) {
    return { status: "error", message: "Votre session a expiré. Reconnectez-vous." }
  }

  const target = memberTargetSchema.safeParse({ organizationId, userId })
  if (!target.success) {
    return { status: "error", message: "Les données du formulaire sont invalides." }
  }

  try {
    const members = new OrganizationMemberService(
      new SupabaseOrganizationMemberRepository(supabase),
    )
    const detail = await members.listByOrganizationWithDetails(organizationId)
    const member = detail.find((entry) => entry.userId === userId)
    if (!member) {
      return { status: "error", message: "Ce membre n'est pas présent dans l'organisation." }
    }

    const owners = detail.filter((entry) => entry.roleName === "owner")
    if (member.roleName === "owner" && owners.length <= 1) {
      return { status: "error", message: "Impossible de retirer le dernier propriétaire." }
    }

    await members.remove(organizationId, userId)

    await recordAuditLog(supabase, {
      actorId: user.id,
      organizationId,
      action: "members.remove",
      resourceType: "member",
      resourceId: userId,
      metadata: { roleId: member.roleId },
    })
  } catch (error) {
    return { status: "error", message: describeOrgMutationFailure(error) }
  }

  orgMutationLimiter.reset(ipKey)
  return { status: "success", message: "Membre retiré de l'organisation." }
}

async function getSessionContext() {
  const supabase = await createServerSupabaseClient()
  const auth = new AdminAuthService(new SupabaseAdminAuthAdapter(supabase))
  const user = await auth.getUser()
  return { supabase, user }
}

function mapOrganizationFieldErrors(error: z.ZodError): ActionFieldErrors {
  const nameInvalid = error.issues.some((issue) => issue.path[0] === "name")
  const slugInvalid = error.issues.some((issue) => issue.path[0] === "slug")

  return {
    name: nameInvalid ? "Le nom doit contenir entre 1 et 100 caractères." : undefined,
    slug: slugInvalid
      ? "Slug invalide : minuscules, chiffres et tirets uniquement."
      : undefined,
  }
}

function describeOrgMutationFailure(error: unknown): string {
  const detail = readErrorDetail(error)
  if (detail && (detail.code === "23505" || detail.message.toLowerCase().includes("duplicate key"))) {
    return "Ce slug est déjà utilisé."
  }
  return "L'opération a échoué. Vérifiez vos droits d'accès et réessayez."
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