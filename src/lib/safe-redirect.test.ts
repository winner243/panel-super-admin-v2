import { describe, expect, it } from "vitest"
import { isSafeRedirectPath, resolveSafeRedirect } from "./safe-redirect"

describe("isSafeRedirectPath", () => {
  it("accepte les chemins relatifs internes", () => {
    expect(isSafeRedirectPath("/")).toBe(true)
    expect(isSafeRedirectPath("/organizations")).toBe(true)
    expect(isSafeRedirectPath("/users?page=2")).toBe(true)
  })

  it("refuse les URLs absolues", () => {
    expect(isSafeRedirectPath("https://evil.com")).toBe(false)
    expect(isSafeRedirectPath("http://evil.com")).toBe(false)
  })

  it("refuse les pseudo-URLs relatives", () => {
    expect(isSafeRedirectPath("//evil.com")).toBe(false)
    expect(isSafeRedirectPath("javascript:alert(1)")).toBe(false)
  })

  it("refuse les chemins avec backslash ou caractères malveillants", () => {
    expect(isSafeRedirectPath("/\\evil.com")).toBe(false)
  })
})

describe("resolveSafeRedirect", () => {
  it("retombe sur le défaut si absent", () => {
    expect(resolveSafeRedirect(undefined)).toBe("/")
    expect(resolveSafeRedirect(null)).toBe("/")
    expect(resolveSafeRedirect("")).toBe("/")
  })

  it("retombe sur le défaut si non sûr", () => {
    expect(resolveSafeRedirect("https://evil.com", "/dashboard")).toBe("/dashboard")
  })

  it("retourne le chemin sûr tel quel", () => {
    expect(resolveSafeRedirect("/users", "/dashboard")).toBe("/users")
  })
})