import { describe, expect, it } from "vitest"
import {
  parseCreatePayment,
  parseUpdatePayment,
  paymentStatusSchema,
  paymentMethodTypeSchema,
} from "./payment"

const VALID_UUID = "123e4567-e89b-42d3-a456-426614174000"

describe("paymentStatusSchema", () => {
  it("accepte tous les statuts valides", () => {
    const statuses = [
      "succeeded",
      "pending",
      "failed",
      "canceled",
      "refunded",
      "partially_refunded",
      "disputed",
    ]
    for (const status of statuses) {
      expect(paymentStatusSchema.parse(status)).toBe(status)
    }
  })

  it("rejette un statut invalide", () => {
    expect(() => paymentStatusSchema.parse("invalid")).toThrow()
  })
})

describe("paymentMethodTypeSchema", () => {
  it("accepte tous les types valides", () => {
    const types = ["card", "bank_transfer", "mobile_money", "paypal", "other"]
    for (const type of types) {
      expect(paymentMethodTypeSchema.parse(type)).toBe(type)
    }
  })

  it("rejette un type invalide", () => {
    expect(() => paymentMethodTypeSchema.parse("bitcoin")).toThrow()
  })
})

describe("parseCreatePayment", () => {
  const valid = {
    organizationId: VALID_UUID,
    provider: "stripe",
    status: "pending",
    currency: "USD",
  }

  it("accepte un input minimal valide", () => {
    const parsed = parseCreatePayment(valid)
    expect(parsed.organizationId).toBe(VALID_UUID)
    expect(parsed.provider).toBe("stripe")
    expect(parsed.status).toBe("pending")
    expect(parsed.currency).toBe("USD")
  })

  it("rejette un organizationId invalide", () => {
    expect(() =>
      parseCreatePayment({ ...valid, organizationId: "not-uuid" }),
    ).toThrow()
  })

  it("rejette un provider vide", () => {
    expect(() =>
      parseCreatePayment({ ...valid, provider: "" }),
    ).toThrow()
  })

  it("rejette un currency pas de 3 lettres", () => {
    expect(() =>
      parseCreatePayment({ ...valid, currency: "US" }),
    ).toThrow()
  })

  it("accepte les optionnels", () => {
    const parsed = parseCreatePayment({
      ...valid,
      subscriptionId: VALID_UUID,
      providerPaymentReference: "pay_123",
      amount: 99.99,
      paymentMethodType: "card",
      metadata: { test: true },
    })
    expect(parsed.amount).toBe(99.99)
    expect(parsed.paymentMethodType).toBe("card")
  })
})

describe("parseUpdatePayment", () => {
  it("accepte un seul champ modifie", () => {
    const parsed = parseUpdatePayment({ status: "succeeded" })
    expect(parsed.status).toBe("succeeded")
  })

  it("accepte update partiel", () => {
    const parsed = parseUpdatePayment({
      amount: 149.99,
      paymentMethodType: "bank_transfer",
    })
    expect(parsed.amount).toBe(149.99)
    expect(parsed.paymentMethodType).toBe("bank_transfer")
  })
})