import { describe, expect, it } from "vitest"
import {
  toRolePermission,
  toRolePermissionInsert,
  type RolePermissionRow,
} from "./role-permission"

const row: RolePermissionRow = {
  role_id: "00000000-0000-0000-0000-000000000001",
  permission_id: "00000000-0000-0000-0000-000000000002",
  created_at: "2026-01-01T00:00:00.000Z",
}

describe("toRolePermission", () => {
  it("mappe une ligne vers le domaine", () => {
    expect(toRolePermission(row)).toEqual({
      roleId: row.role_id,
      permissionId: row.permission_id,
      createdAt: row.created_at,
    })
  })
})

describe("toRolePermissionInsert", () => {
  it("construit l’insertion du couple rôle-permission", () => {
    expect(
      toRolePermissionInsert({
        roleId: row.role_id,
        permissionId: row.permission_id,
      }),
    ).toEqual({
      role_id: row.role_id,
      permission_id: row.permission_id,
    })
  })
})