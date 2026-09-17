import type { RolePermissionRepository } from "@/repositories/role-permission.repository"
import type { RolePermission } from "@/types/role-permission"
import { parseAssignRolePermission } from "@/validators/role-permission"

export class RolePermissionService {
  constructor(private readonly rolePermissions: RolePermissionRepository) {}

  async list(): Promise<RolePermission[]> {
    return this.rolePermissions.list()
  }

  async listByRole(roleId: string): Promise<RolePermission[]> {
    return this.rolePermissions.listByRole(roleId)
  }

  async assign(input: unknown): Promise<RolePermission> {
    const parsed = parseAssignRolePermission(input)
    return this.rolePermissions.assign(parsed)
  }

  async unassign(roleId: string, permissionId: string): Promise<void> {
    return this.rolePermissions.unassign(roleId, permissionId)
  }
}