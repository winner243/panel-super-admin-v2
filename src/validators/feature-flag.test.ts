import { describe, expect, it } from "vitest"
import {
  parseCreateFeatureFlag,
  parseUpdateFeatureFlag,
  featureFlagScopeSchema,
} from "./feature-flag"

describe("featureFlagScopeSchema", () => {
  it("accepte global et organization", () => {
    expect(featureFlagScopeSchema.parse("global")).toBe("global")
    expect(featureFlagScopeSchema.parse("organization")).toBe("organization")
  })

  it("rejette un scope invalide", () => {
    expect(() => featureFlagScopeSchema.parse("tenant")).toThrow()
  })
})

describe("parseCreateFeatureFlag", () => {
  const valid = {
    key: "my-feature",
    name: "My Feature",
    enabled: false,
    scope: "global",
  }

  it("accepte un input valide", () => {
    const parsed = parseCreateFeatureFlag(valid)
    expect(parsed.key).toBe("my-feature")
    expect(parsed.name).toBe("My Feature")
    expect(parsed.enabled).toBe(false)
    expect(parsed.scope).toBe("global")
  })

  it("rejette une cle avec caractères invalides", () => {
    expect(() =>
      parseCreateFeatureFlag({ ...valid, key: "My Feature!" }),
    ).toThrow()
  })

  it("rejette une cle vide", () => {
    expect(() =>
      parseCreateFeatureFlag({ ...valid, key: "" }),
    ).toThrow()
  })

  it("rejette un nom vide", () => {
    expect(() =>
      parseCreateFeatureFlag({ ...valid, name: "" }),
    ).toThrow()
  })

  it("accepte description optionnelle", () => {
    const parsed = parseCreateFeatureFlag({
      ...valid,
      description: "Une description",
    })
    expect(parsed.description).toBe("Une description")
  })
})

describe("parseUpdateFeatureFlag", () => {
  it("accepte un seul champ modifie", () => {
    const parsed = parseUpdateFeatureFlag({ enabled: true })
    expect(parsed.enabled).toBe(true)
  })

  it("accepte update partiel", () => {
    const parsed = parseUpdateFeatureFlag({
      name: "Nouveau nom",
      description: "Nouvelle description",
    })
    expect(parsed.name).toBe("Nouveau nom")
    expect(parsed.description).toBe("Nouvelle description")
  })

  it("rejette une cle invalide", () => {
    expect(() =>
      parseUpdateFeatureFlag({ key: "Invalid Key!" }),
    ).toThrow()
  })
})