import { describe, expect, it } from "vitest"
import {
  parseCreateSubscription,
  parseUpdateSubscription,
  subscriptionStatusSchema,
} from "./subscription"

const VALID_UUID = "123e4567-e89b-42d3-a456-426614174000"

describe("subscriptionStatusSchema", () => {
  it("accepte tous les statuts valides", () => {
    const statuses = [
      "active",
      "canceled",
      "past_due",
      "trialing",
      "incomplete",
      "incomplete_expired",
      "unpaid",
      "paused",
    ]
    for (const status of statuses) {
      expect(subscriptionStatusSchema.parse(status)).toBe(status)
    }
  })

  it("rejette un statut invalide", () => {
    expect(() => subscriptionStatusSchema.parse("invalid")).toThrow()
  })
})

describe("parseCreateSubscription", () => {
  const valid = {
    organizationId: VALID_UUID,
    planId: "plan-pro",
    status: "active",
    startDate: "2026-01-01T00:00:00Z",
  }

  it("accepte un input minimal valide", () => {
    const parsed = parseCreateSubscription(valid)
    expect(parsed.organizationId).toBe(VALID_UUID)
    expect(parsed.planId).toBe("plan-pro")
    expect(parsed.status).toBe("active")
  })

  it("rejette un organizationId invalide", () => {
    expect(() =>
      parseCreateSubscription({ ...valid, organizationId: "not-uuid" }),
    ).toThrow()
  })

  it("rejette un planId vide", () => {
    expect(() =>
      parseCreateSubscription({ ...valid, planId: "" }),
    ).toThrow()
  })

  it("rejette un startDate invalide", () => {
    expect(() =>
      parseCreateSubscription({ ...valid, startDate: "not-a-date" }),
    ).toThrow()
  })

  it("accepte les optionnels", () => {
    const parsed = parseCreateSubscription({
      ...valid,
      endDate: "2027-01-01T00:00:00Z",
      renewalDate: "2026-02-01T00:00:00Z",
      canceledAt: null,
      providerReference: "sub_123",
      metadata: { plan: "pro" },
    })
    expect(parsed.endDate).toBe("2027-01-01T00:00:00Z")
    expect(parsed.providerReference).toBe("sub_123")
  })
})

describe("parseUpdateSubscription", () => {
  it("accepte un seul champ modifie", () => {
    const parsed = parseUpdateSubscription({ status: "canceled" })
    expect(parsed.status).toBe("canceled")
  })

  it("accepte update partiel", () => {
    const parsed = parseUpdateSubscription({
      planId: "plan-enterprise",
      renewalDate: "2026-06-01T00:00:00Z",
    })
    expect(parsed.planId).toBe("plan-enterprise")
    expect(parsed.renewalDate).toBe("2026-06-01T00:00:00Z")
  })
})