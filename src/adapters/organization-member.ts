import type { Database } from "@/infrastructure/supabase/database"
import type {
  AddOrganizationMemberInput,
  OrganizationMember,
  OrganizationMemberWithDetails,
  UpdateOrganizationMemberInput,
} from "@/types/organization-member"

export type OrganizationMemberRow =
  Database["public"]["Tables"]["organization_members"]["Row"]
export type OrganizationMemberInsert =
  Database["public"]["Tables"]["organization_members"]["Insert"]
export type OrganizationMemberUpdate =
  Database["public"]["Tables"]["organization_members"]["Update"]

export type OrganizationMemberWithProfileRow =
  Database["public"]["Tables"]["organization_members"]["Row"] & {
    profiles: Pick<
      Database["public"]["Tables"]["profiles"]["Row"],
      "id" | "full_name" | "avatar_url"
    > | null
    roles: Pick<Database["public"]["Tables"]["roles"]["Row"], "id" | "name"> | null
  }

export function toOrganizationMember(row: OrganizationMemberRow): OrganizationMember {
  return {
    organizationId: row.organization_id,
    userId: row.user_id,
    roleId: row.role_id,
    createdAt: row.created_at,
  }
}

export function toOrganizationMemberInsert(
  input: AddOrganizationMemberInput,
): OrganizationMemberInsert {
  return {
    organization_id: input.organizationId,
    user_id: input.userId,
    role_id: input.roleId,
  }
}

export function toOrganizationMemberUpdate(
  input: UpdateOrganizationMemberInput,
): OrganizationMemberUpdate {
  return {
    role_id: input.roleId,
  }
}

export function toOrganizationMemberWithDetails(
  row: OrganizationMemberWithProfileRow,
): OrganizationMemberWithDetails {
  return {
    userId: row.user_id,
    roleId: row.roles?.id ?? row.role_id,
    roleName: row.roles?.name ?? "inconnu",
    fullName: row.profiles?.full_name ?? null,
    avatarUrl: row.profiles?.avatar_url ?? null,
    createdAt: row.created_at,
  }
}