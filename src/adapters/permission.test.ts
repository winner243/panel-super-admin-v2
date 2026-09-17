import { describe, expect, it } from "vitest"
import {
  toPermission,
  toPermissionInsert,
  type PermissionRow,
} from "./permission"

const row: PermissionRow = {
  id: "00000000-0000-0000-0000-000000000001",
  key: "organizations.update",
  name: "Modifier les organisations",
  description: "Permet de modifier une organisation",
  created_at: "2026-01-01T00:00:00.000Z",
}

describe("toPermission", () => {
  it("mappe une ligne vers le domaine", () => {
    expect(toPermission(row)).toEqual({
      id: row.id,
      key: "organizations.update",
      name: "Modifier les organisations",
      description: "Permet de modifier une organisation",
      createdAt: row.created_at,
    })
  })

  it("conserve une description nulle", () => {
    const mapped = toPermission({ ...row, description: null })
    expect(mapped.description).toBeNull()
  })
})

describe("toPermissionInsert", () => {
  it("construit l’insertion minimale", () => {
    expect(toPermissionInsert({ key: "organizations.update", name: "Modifier" })).toEqual({
      key: "organizations.update",
      name: "Modifier",
      description: null,
    })
  })

  it("inclut la description lorsqu’elle est fournie", () => {
    expect(
      toPermissionInsert({
        key: "organizations.update",
        name: "Modifier",
        description: "Permet de modifier",
      }),
    ).toEqual({
      key: "organizations.update",
      name: "Modifier",
      description: "Permet de modifier",
    })
  })
})