import { test, expect } from "@playwright/test"
import {
  hasCredentials,
  E2E_RUN_MUTATIONS,
  SKIP_NO_CREDENTIALS,
  SKIP_NO_MUTATIONS,
} from "./support/env"

test.describe("Users — profil (DEV)", () => {
  test("la page Mon profil est accessible et affiche le formulaire", async ({ page }) => {
    test.skip(!hasCredentials, SKIP_NO_CREDENTIALS)

    await page.goto("/users")

    await expect(page.getByRole("heading", { name: "Mon profil" })).toBeVisible()
    await expect(page.getByLabel("Adresse e-mail")).toBeVisible()
    await expect(page.getByLabel("Nom complet")).toBeVisible()
    await expect(page.getByRole("button", { name: "Enregistrer" })).toBeVisible()
  })

  test("modification du nom complet du profil (écriture DEV)", async ({ page }) => {
    test.skip(!hasCredentials, SKIP_NO_CREDENTIALS)
    test.skip(!E2E_RUN_MUTATIONS, SKIP_NO_MUTATIONS)

    await page.goto("/users")

    const fullName = page.getByLabel("Nom complet")
    await fullName.fill("Utilisateur E2E")
    await page.getByRole("button", { name: "Enregistrer" }).click()

    await expect(page.getByText("Profil mis à jour.")).toBeVisible()
  })
})