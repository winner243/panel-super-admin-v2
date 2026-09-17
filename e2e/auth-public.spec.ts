import { test, expect } from "@playwright/test"

// Ces tests n'exigent aucun compte : ils partent toujours d'un état déconnecté,
// quel que soit l'état de session partagé produit par le project "setup".
test.use({ storageState: { cookies: [], origins: [] } })

test.describe("Auth — surfaces publiques", () => {
  test("la page /auth/login est accessible et présente le formulaire", async ({ page }) => {
    await page.goto("/auth/login")

    await expect(page.getByRole("heading", { name: "Connexion" })).toBeVisible()
    await expect(page.getByLabel("Adresse e-mail")).toBeVisible()
    await expect(page.getByLabel("Mot de passe")).toBeVisible()
    await expect(page.getByRole("button", { name: "Se connecter" })).toBeVisible()
  })

  test("les routes privées redirigent vers /auth/login sans session", async ({ page }) => {
    const protectedPaths = ["/", "/users", "/organizations", "/audit", "/settings", "/roles", "/permissions"]

    for (const route of protectedPaths) {
      await page.goto(route)
      await expect(page).toHaveURL(/\/auth\/login/)
      await expect(page.getByRole("heading", { name: "Connexion" })).toBeVisible()
    }
  })

  test("navigation clavier sur le formulaire de connexion", async ({ page }) => {
    await page.goto("/auth/login")

    const email = page.getByLabel("Adresse e-mail")
    const password = page.getByLabel("Mot de passe")
    const submit = page.getByRole("button", { name: "Se connecter" })

    await email.focus()
    await expect(email).toBeFocused()
    await page.keyboard.press("Tab")
    await expect(password).toBeFocused()
    await page.keyboard.press("Tab")
    await expect(submit).toBeFocused()
  })
})