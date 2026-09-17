import type { Database } from "@/infrastructure/supabase/database"
import type {
  CreateOrganizationInput,
  Organization,
  UpdateOrganizationInput,
} from "@/types/organization"

export type OrganizationRow = Database["public"]["Tables"]["organizations"]["Row"]
export type OrganizationInsert = Database["public"]["Tables"]["organizations"]["Insert"]
export type OrganizationUpdate = Database["public"]["Tables"]["organizations"]["Update"]

export function toOrganization(row: OrganizationRow): Organization {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function toOrganizationInsert(input: CreateOrganizationInput): OrganizationInsert {
  return {
    name: input.name,
    slug: input.slug,
    created_by: input.createdBy,
  }
}

export function toOrganizationUpdate(input: UpdateOrganizationInput): OrganizationUpdate {
  return {
    ...(input.name !== undefined && { name: input.name }),
    ...(input.slug !== undefined && { slug: input.slug }),
  }
}