import { describe, expect, it } from "vitest"
import {
  toRole,
  toRoleInsert,
  toRoleUpdate,
  type RoleRow,
} from "./role"

const row: RoleRow = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "admin",
  description: "Administrateur",
  is_system: true,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-02T00:00:00.000Z",
}

describe("toRole", () => {
  it("mappe une ligne vers le domaine", () => {
    expect(toRole(row)).toEqual({
      id: row.id,
      name: "admin",
      description: "Administrateur",
      isSystem: true,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })
  })

  it("conserve une description nulle", () => {
    const mapped = toRole({ ...row, description: null })
    expect(mapped.description).toBeNull()
  })
})

describe("toRoleInsert", () => {
  it("construit l’insertion minimale", () => {
    expect(toRoleInsert({ name: "admin" })).toEqual({
      name: "admin",
      description: null,
    })
  })

  it("inclut les champs optionnels explicitement fournis", () => {
    expect(
      toRoleInsert({ name: "admin", description: "Admins", isSystem: true }),
    ).toEqual({
      name: "admin",
      description: "Admins",
      is_system: true,
    })
  })
})

describe("toRoleUpdate", () => {
  it("ne renvoie un champ que s’il est fourni", () => {
    expect(toRoleUpdate({ description: "Nouvelle description" })).toEqual({
      description: "Nouvelle description",
    })
  })

  it("renvoie un objet vide pour une mise à jour vide", () => {
    expect(toRoleUpdate({})).toEqual({})
  })
})