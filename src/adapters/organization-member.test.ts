import { describe, expect, it } from "vitest"
import {
  toOrganizationMemberWithDetails,
  type OrganizationMemberWithProfileRow,
} from "./organization-member"

const base: OrganizationMemberWithProfileRow = {
  organization_id: "00000000-0000-0000-0000-000000000001",
  user_id: "00000000-0000-0000-0000-000000000002",
  role_id: "00000000-0000-0000-0000-000000000003",
  created_at: "2026-01-01T00:00:00.000Z",
  profiles: {
    id: "00000000-0000-0000-0000-000000000002",
    full_name: "Marie Dupont",
    avatar_url: null,
  },
  roles: {
    id: "00000000-0000-0000-0000-000000000003",
    name: "admin",
  },
}

describe("toOrganizationMemberWithDetails", () => {
  it("mappe membre, profil et rôle", () => {
    expect(toOrganizationMemberWithDetails(base)).toEqual({
      userId: "00000000-0000-0000-0000-000000000002",
      roleId: "00000000-0000-0000-0000-000000000003",
      roleName: "admin",
      fullName: "Marie Dupont",
      avatarUrl: null,
      createdAt: "2026-01-01T00:00:00.000Z",
    })
  })

  it("tient compte d’un profil minimal non renseigné", () => {
    const row: OrganizationMemberWithProfileRow = {
      ...base,
      profiles: null,
    }
    const mapped = toOrganizationMemberWithDetails(row)
    expect(mapped.fullName).toBeNull()
    expect(mapped.avatarUrl).toBeNull()
  })

  it("retombe sur l’identifiant du rôle si le rôle est absent", () => {
    const row: OrganizationMemberWithProfileRow = {
      ...base,
      roles: null,
    }
    const mapped = toOrganizationMemberWithDetails(row)
    expect(mapped.roleId).toBe("00000000-0000-0000-0000-000000000003")
    expect(mapped.roleName).toBe("inconnu")
  })
})