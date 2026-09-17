import { describe, expect, it } from "vitest"
import {
  toOrganization,
  toOrganizationInsert,
  type OrganizationRow,
} from "./organization"

const row: OrganizationRow = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "Acme",
  slug: "acme",
  created_by: "00000000-0000-0000-0000-000000000002",
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-02T00:00:00.000Z",
}

describe("toOrganization", () => {
  it("mappe une ligne Supabase vers le domaine camelCase", () => {
    expect(toOrganization(row)).toEqual({
      id: "00000000-0000-0000-0000-000000000001",
      name: "Acme",
      slug: "acme",
      createdBy: "00000000-0000-0000-0000-000000000002",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
    })
  })
})

describe("toOrganizationInsert", () => {
  it("mappe un input domaine vers le payload snake_case", () => {
    const result = toOrganizationInsert({
      name: "Acme",
      slug: "acme",
      createdBy: "00000000-0000-0000-0000-000000000002",
    })

    expect(result).toEqual({
      name: "Acme",
      slug: "acme",
      created_by: "00000000-0000-0000-0000-000000000002",
    })
  })
})