import type { Database } from "@/infrastructure/supabase/database"
import type { CreatePermissionInput, Permission } from "@/types/permission"

export type PermissionRow = Database["public"]["Tables"]["permissions"]["Row"]
export type PermissionInsert = Database["public"]["Tables"]["permissions"]["Insert"]
export type PermissionUpdate = Database["public"]["Tables"]["permissions"]["Update"]

export function toPermission(row: PermissionRow): Permission {
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
  }
}

export function toPermissionInsert(input: CreatePermissionInput): PermissionInsert {
  return {
    key: input.key,
    name: input.name,
    description: input.description ?? null,
  }
}