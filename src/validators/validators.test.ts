import { describe, expect, it } from "vitest"
import { createProfileSchema, parseCreateProfile, parseUpdateProfile } from "./profile"
import {
  organizationSlugSchema,
  parseCreateOrganization,
  parseUpdateOrganization,
} from "./organization"

const VALID_UUID = "123e4567-e89b-42d3-a456-426614174000"

describe("parseCreateProfile", () => {
  it("accepte un input minimal valide", () => {
    const input = { id: VALID_UUID }
    expect(parseCreateProfile(input)).toEqual({
      id: VALID_UUID,
      fullName: undefined,
      avatarUrl: undefined,
    })
  })

  it("accepte fullName et avatarUrl valides", () => {
    const input = {
      id: VALID_UUID,
      fullName: "  Marie Dupont  ",
      avatarUrl: "https://example.com/avatar.png",
    }
    const parsed = createProfileSchema.parse(input)
    expect(parsed.fullName).toBe("Marie Dupont")
  })

  it("rejette un id non uuid", () => {
    expect(() => parseCreateProfile({ id: "pas-un-uuid" })).toThrow()
  })

  it("rejette un avatarUrl invalide", () => {
    expect(() =>
      parseUpdateProfile({ avatarUrl: "pas-une-url" }),
    ).toThrow()
  })
})

describe("organizationSlugSchema", () => {
  it("accepte les slugs kebab-case", () => {
    expect(organizationSlugSchema.parse("acme-corp")).toBe("acme-corp")
    expect(organizationSlugSchema.parse("acme")).toBe("acme")
  })

  it("rejette les slugs invalides", () => {
    expect(() => organizationSlugSchema.parse("Acme Corp")).toThrow()
    expect(() => organizationSlugSchema.parse("acme--corp")).toThrow()
    expect(() => organizationSlugSchema.parse("acme_")).toThrow()
  })
})

describe("parseCreateOrganization", () => {
  const valid = {
    name: "Acme",
    slug: "acme-corp",
    createdBy: VALID_UUID,
  }

  it("accepte un input valide", () => {
    expect(parseCreateOrganization(valid)).toEqual(valid)
  })

  it("rejette un slug invalide", () => {
    expect(() => parseCreateOrganization({ ...valid, slug: "Acme" })).toThrow()
  })

  it("rejette un createdBy non uuid", () => {
    expect(() => parseCreateOrganization({ ...valid, createdBy: "x" })).toThrow()
  })
})

describe("parseUpdateOrganization", () => {
  it("accepte un seul champ modifié", () => {
    expect(parseUpdateOrganization({ name: "Acme Nouveau" })).toEqual({
      name: "Acme Nouveau",
      slug: undefined,
    })
  })
})