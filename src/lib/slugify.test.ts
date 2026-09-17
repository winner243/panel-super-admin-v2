import { describe, expect, it } from "vitest"
import { slugify } from "./slugify"

describe("slugify", () => {
  it("convertit un nom en kebab-case", () => {
    expect(slugify("Acme Corp")).toBe("acme-corp")
  })

  it("retire les accents", () => {
    expect(slugify("Élan Café")).toBe("elan-cafe")
  })

  it("réduit les espaces multiples et les tirets", () => {
    expect(slugify("  Acme   Corp  ")).toBe("acme-corp")
  })

  it("gère les chiffres", () => {
    expect(slugify("V2 Platform")).toBe("v2-platform")
  })

  it("retourne une chaîne vide pour un contenu non alphanumérique", () => {
    expect(slugify("!!!")).toBe("")
  })
})