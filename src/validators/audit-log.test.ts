import { describe, expect, it } from "vitest"
import { parseCreateAuditLog, sanitizeAuditMetadata } from "./audit-log"

const VALID_UUID = "123e4567-e89b-42d3-a456-426614174000"

describe("sanitizeAuditMetadata", () => {
  it("retourne un objet vide pour des entrées invalides", () => {
    expect(sanitizeAuditMetadata(null)).toEqual({})
    expect(sanitizeAuditMetadata([1, 2])).toEqual({})
    expect(sanitizeAuditMetadata("string")).toEqual({})
  })

  it("conserve les scalaires valides (string, number, boolean, null)", () => {
    expect(
      sanitizeAuditMetadata({
        text: "hello",
        num: 42,
        flag: true,
        nil: null,
      }),
    ).toEqual({ text: "hello", num: 42, flag: true, nil: null })
  })

  it("élimine les clés vides ou trop longues", () => {
    expect(sanitizeAuditMetadata({ "": "bad" })).toEqual({})
    expect(sanitizeAuditMetadata({ ["a".repeat(41)]: "bad" })).toEqual({})
  })

  it("élimine les valeurs de type objet ou tableau", () => {
    expect(sanitizeAuditMetadata({ nested: { x: 1 }, arr: [1, 2] })).toEqual({})
  })

  it("tronte les strings trop longues", () => {
    const result = sanitizeAuditMetadata({ long: "x".repeat(121) })
    expect(result).toEqual({})
  })

  it("élimine les NaN et Infinity", () => {
    expect(sanitizeAuditMetadata({ bad: Number.NaN })).toEqual({})
    expect(sanitizeAuditMetadata({ bad: Infinity })).toEqual({})
  })

  it("respecte la limite de 12 clés", () => {
    const input: Record<string, number> = {}
    for (let i = 0; i < 15; i++) input[`k${i}`] = i
    const result = sanitizeAuditMetadata(input)
    expect(Object.keys(result)).toHaveLength(12)
  })
})

describe("parseCreateAuditLog", () => {
  const base = {
    actorId: VALID_UUID,
    action: "organizations.create",
  }

  it("accepte un input minimal valide", () => {
    const parsed = parseCreateAuditLog(base)
    expect(parsed.action).toBe("organizations.create")
    expect(parsed.actorId).toBe(VALID_UUID)
    expect(parsed.status).toBe("success")
    expect(parsed.metadata).toEqual({})
  })

  it("sanitise les metadata à l'insertion", () => {
    const parsed = parseCreateAuditLog({
      ...base,
      metadata: { safe: "ok", nested: { a: 1 } },
    })
    expect(parsed.metadata).toEqual({ safe: "ok" })
  })

  it("rejette une action mal formée", () => {
    expect(() => parseCreateAuditLog({ ...base, action: "ACTION" })).toThrow()
  })

  it("rejette une action sans point de séparation", () => {
    expect(() => parseCreateAuditLog({ ...base, action: "organizations" })).toThrow()
  })

  it("rejette un actorId vide", () => {
    expect(() => parseCreateAuditLog({ ...base, actorId: "   " })).toThrow()
  })

  it("valide l'organizationId quand fourni", () => {
    expect(() =>
      parseCreateAuditLog({ ...base, organizationId: "not-a-uuid" }),
    ).toThrow()
  })

  it("valide le status", () => {
    const parsed = parseCreateAuditLog({ ...base, status: "failed" })
    expect(parsed.status).toBe("failed")
  })

  it("définit status à success par défaut", () => {
    expect(parseCreateAuditLog(base).status).toBe("success")
  })

  it("rejette un status inconnu", () => {
    expect(() => parseCreateAuditLog({ ...base, status: "unknown" })).toThrow()
  })
})