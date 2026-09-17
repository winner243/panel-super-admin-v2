import { describe, expect, it } from "vitest"
import { parseCreateRole, parseUpdateRole } from "./role"
import { parseCreatePermission, parsePermissionKey } from "./permission"
import { parseAssignRolePermission } from "./role-permission"

const VALID_UUID = "123e4567-e89b-42d3-a456-426614174000"

describe("parseCreateRole", () => {
  it("accepte un nom valide", () => {
    expect(parseCreateRole({ name: "  admin  " })).toEqual({
      name: "admin",
      description: undefined,
      isSystem: undefined,
    })
  })

  it("accepte une description facultative", () => {
    const parsed = parseCreateRole({
      name: "admin",
      description: "  Administrateurs  ",
    })
    expect(parsed.description).toBe("Administrateurs")
  })

  it("rejette un nom vide", () => {
    expect(() => parseCreateRole({ name: "   " })).toThrow()
  })

  it("rejette un nom trop long", () => {
    expect(() => parseCreateRole({ name: "a".repeat(81) })).toThrow()
  })
})

describe("parseUpdateRole", () => {
  it("accepte une mise à jour partielle", () => {
    expect(parseUpdateRole({ description: "Nouveau" })).toEqual({
      name: undefined,
      description: "Nouveau",
    })
  })
})

describe("parseCreatePermission", () => {
  it("accepte une clé domain.action", () => {
    expect(parseCreatePermission({ key: "organizations.update", name: "Modifier" })).toEqual({
      key: "organizations.update",
      name: "Modifier",
      description: undefined,
    })
  })

  it("rejette une clé sans point", () => {
    expect(() => parseCreatePermission({ key: "organizations", name: "X" })).toThrow()
  })

  it("rejette une clé en majuscules", () => {
    expect(() => parseCreatePermission({ key: "Organizations.Update", name: "X" })).toThrow()
  })
})

describe("parsePermissionKey", () => {
  it("accepte les clés imbriquées", () => {
    expect(parsePermissionKey("organizations.members.manage")).toBe(
      "organizations.members.manage",
    )
  })

  it("rejette les clés vides", () => {
    expect(() => parsePermissionKey("")).toThrow()
  })
})

describe("parseAssignRolePermission", () => {
  it("accepte un couple rôle-permission valide", () => {
    expect(
      parseAssignRolePermission({ roleId: VALID_UUID, permissionId: VALID_UUID }),
    ).toEqual({ roleId: VALID_UUID, permissionId: VALID_UUID })
  })

  it("rejette un rôle invalide", () => {
    expect(() =>
      parseAssignRolePermission({ roleId: "x", permissionId: VALID_UUID }),
    ).toThrow()
  })

  it("rejette une permission invalide", () => {
    expect(() =>
      parseAssignRolePermission({ roleId: VALID_UUID, permissionId: "x" }),
    ).toThrow()
  })
})