import { describe, expect, it } from "vitest"
import { createRateLimiter } from "./rate-limit"

describe("createRateLimiter", () => {
  it("autorise les tentatives sous la limite maximale", () => {
    const limiter = createRateLimiter<"ip">({
      windowMs: 1000,
      maxAttempts: 3,
      lockDurationMs: 1000,
    })

    expect(limiter.check("ip").allowed).toBe(true)
    expect(limiter.check("ip").allowed).toBe(true)
    expect(limiter.check("ip").allowed).toBe(true)
  })

  it("bloque au-delà de la limite maximale", () => {
    const limiter = createRateLimiter<"ip">({
      windowMs: 1000,
      maxAttempts: 2,
      lockDurationMs: 5000,
    })

    limiter.check("ip")
    limiter.check("ip")

    const blocked = limiter.check("ip")
    expect(blocked.allowed).toBe(false)
    expect(blocked.retryAfterMs).toBeGreaterThan(0)
  })

  it("bloque pendant la durée de blocage", () => {
    const limiter = createRateLimiter<"ip">({
      windowMs: 10,
      maxAttempts: 1,
      lockDurationMs: 60_000,
    })

    limiter.check("ip")
    expect(limiter.check("ip").allowed).toBe(false)
    expect(limiter.check("ip").allowed).toBe(false)
  })

  it("compte les tentatives indépendamment par clé", () => {
    const limiter = createRateLimiter<"a" | "b">({
      windowMs: 1000,
      maxAttempts: 1,
      lockDurationMs: 1000,
    })

    limiter.check("a")
    expect(limiter.check("a").allowed).toBe(false)
    expect(limiter.check("b").allowed).toBe(true)
  })

  it("réinitialise le compteur après un succès", () => {
    const limiter = createRateLimiter<"ip">({
      windowMs: 1000,
      maxAttempts: 1,
      lockDurationMs: 1000,
    })

    limiter.check("ip")
    expect(limiter.check("ip").allowed).toBe(false)

    limiter.reset("ip")
    expect(limiter.check("ip").allowed).toBe(true)
  })
})