import type { Database } from "@/infrastructure/supabase/database"
import type {
  AssignPermissionToRoleInput,
  RolePermission,
} from "@/types/role-permission"

export type RolePermissionRow = Database["public"]["Tables"]["role_permissions"]["Row"]
export type RolePermissionInsert =
  Database["public"]["Tables"]["role_permissions"]["Insert"]
export type RolePermissionUpdate =
  Database["public"]["Tables"]["role_permissions"]["Update"]

export function toRolePermission(row: RolePermissionRow): RolePermission {
  return {
    roleId: row.role_id,
    permissionId: row.permission_id,
    createdAt: row.created_at,
  }
}

export function toRolePermissionInsert(
  input: AssignPermissionToRoleInput,
): RolePermissionInsert {
  return {
    role_id: input.roleId,
    permission_id: input.permissionId,
  }
}