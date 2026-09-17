import { describe, expect, it } from "vitest"
import { parseLoginInput, parseSignUpInput } from "./auth"

describe("parseLoginInput", () => {
  it("accepte des identifiants valides et normalise l'e-mail", () => {
    const result = parseLoginInput({
      email: "  Test@Example.com  ",
      password: "motdepasse",
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.email).toBe("test@example.com")
    }
  })

  it("rejette un e-mail invalide", () => {
    const result = parseLoginInput({ email: "pas-un-email", password: "x" })
    expect(result.success).toBe(false)
  })

  it("rejette un mot de passe vide", () => {
    const result = parseLoginInput({ email: "a@b.com", password: "" })
    expect(result.success).toBe(false)
  })

  it("rejette une entrée non-texte", () => {
    const result = parseLoginInput({ email: 42, password: "x" })
    expect(result.success).toBe(false)
  })
})

describe("parseSignUpInput", () => {
  it("accepte un input valide avec nom et normalise l'e-mail", () => {
    const result = parseSignUpInput({
      email: "Marie@Example.com",
      password: "motdepasse",
      fullName: "  Marie Dupont  ",
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.email).toBe("marie@example.com")
      expect(result.data.fullName).toBe("Marie Dupont")
    }
  })

  it("rejette un mot de passe de moins de 8 caractères", () => {
    const result = parseSignUpInput({ email: "a@b.com", password: "1234567" })
    expect(result.success).toBe(false)
  })

  it("rejette un nom de plus de 120 caractères", () => {
    const result = parseSignUpInput({
      email: "a@b.com",
      password: "motdepasse",
      fullName: "n".repeat(121),
    })
    expect(result.success).toBe(false)
  })

  it("accepte un input sans nom", () => {
    const result = parseSignUpInput({ email: "a@b.com", password: "motdepasse" })
    expect(result.success).toBe(true)
  })
})