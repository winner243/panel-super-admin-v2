import type { Database } from "@/infrastructure/supabase/database"
import type { CreateRoleInput, Role, UpdateRoleInput } from "@/types/role"

export type RoleRow = Database["public"]["Tables"]["roles"]["Row"]
export type RoleInsert = Database["public"]["Tables"]["roles"]["Insert"]
export type RoleUpdate = Database["public"]["Tables"]["roles"]["Update"]

export function toRole(row: RoleRow): Role {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    isSystem: row.is_system,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function toRoleInsert(input: CreateRoleInput): RoleInsert {
  return {
    name: input.name,
    description: input.description ?? null,
    ...(input.isSystem !== undefined && { is_system: input.isSystem }),
  }
}

export function toRoleUpdate(input: UpdateRoleInput): RoleUpdate {
  return {
    ...(input.name !== undefined && { name: input.name }),
    ...(input.description !== undefined && { description: input.description }),
  }
}