import { describe, expect, it } from "vitest"
import { isPublicAuthPath, requiresAuthentication } from "./route-guard"

describe("isPublicAuthPath", () => {
  it("identifie les routes d'authentification publiques", () => {
    expect(isPublicAuthPath("/auth/login")).toBe(true)
    expect(isPublicAuthPath("/auth/register")).toBe(true)
    expect(isPublicAuthPath("/auth/callback")).toBe(true)
    expect(isPublicAuthPath("/auth/callback?code=abc")).toBe(false)
  })

  it("exclut les chemins hors authentification", () => {
    expect(isPublicAuthPath("/")).toBe(false)
    expect(isPublicAuthPath("/users")).toBe(false)
    expect(isPublicAuthPath("/organizations")).toBe(false)
  })
})

describe("requiresAuthentication", () => {
  it("protège le tableau de bord et les routes administratives", () => {
    expect(requiresAuthentication("/")).toBe(true)
    expect(requiresAuthentication("/users")).toBe(true)
    expect(requiresAuthentication("/organizations")).toBe(true)
  })

  it("laisse passer les routes d'authentification", () => {
    expect(requiresAuthentication("/auth/login")).toBe(false)
    expect(requiresAuthentication("/auth/register")).toBe(false)
    expect(requiresAuthentication("/auth/callback")).toBe(false)
  })

  it("laisse passer les assets statiques", () => {
    expect(requiresAuthentication("/_next/static/chunk.js")).toBe(false)
    expect(requiresAuthentication("/_next/image?url=/x.png")).toBe(false)
    expect(requiresAuthentication("/favicon.ico")).toBe(false)
    expect(requiresAuthentication("/_not-found")).toBe(false)
  })
})