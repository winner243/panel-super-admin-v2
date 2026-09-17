import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/infrastructure/supabase/database"
import type {
  AssignPermissionToRoleInput,
  RolePermission,
} from "@/types/role-permission"
import {
  toRolePermission,
  toRolePermissionInsert,
  type RolePermissionRow,
} from "@/adapters/role-permission"

export interface RolePermissionRepository {
  list(): Promise<RolePermission[]>
  listByRole(roleId: string): Promise<RolePermission[]>
  assign(input: AssignPermissionToRoleInput): Promise<RolePermission>
  unassign(roleId: string, permissionId: string): Promise<void>
}

export class SupabaseRolePermissionRepository implements RolePermissionRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async list(): Promise<RolePermission[]> {
    const { data, error } = await this.client
      .from("role_permissions")
      .select("*")

    if (error) throw error
    return data.map(toRolePermission)
  }

  async listByRole(roleId: string): Promise<RolePermission[]> {
    const { data, error } = await this.client
      .from("role_permissions")
      .select("*")
      .eq("role_id", roleId)

    if (error) throw error
    return data.map(toRolePermission)
  }

  async assign(input: AssignPermissionToRoleInput): Promise<RolePermission> {
    const { data, error } = await this.client
      .from("role_permissions")
      .upsert(toRolePermissionInsert(input), {
        onConflict: "role_id,permission_id",
      })
      .select()
      .single<RolePermissionRow>()

    if (error) throw error
    return toRolePermission(data)
  }

  async unassign(roleId: string, permissionId: string): Promise<void> {
    const { error } = await this.client
      .from("role_permissions")
      .delete()
      .eq("role_id", roleId)
      .eq("permission_id", permissionId)

    if (error) throw error
  }
}