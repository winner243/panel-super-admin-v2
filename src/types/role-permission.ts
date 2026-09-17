export interface RolePermission {
  roleId: string
  permissionId: string
  createdAt: string
}

export type AssignPermissionToRoleInput = Pick<RolePermission, "roleId" | "permissionId">