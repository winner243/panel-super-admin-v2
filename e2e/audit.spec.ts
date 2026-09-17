import { test, expect } from "@playwright/test"
import { hasCredentials, SKIP_NO_CREDENTIALS } from "./support/env"

test.describe("Audit Logs — consultabilité (DEV)", () => {
  test("la page /audit est accessible et affiche les filtres", async ({ page }) => {
    test.skip(!hasCredentials, SKIP_NO_CREDENTIALS)

    await page.goto("/audit")

    await expect(page.getByRole("heading", { name: "Audit Logs" })).toBeVisible()

    await expect(page.getByRole("combobox", { name: "Contexte" })).toBeVisible()
  })

  test("la page /audit affiche le résumé des événements", async ({ page }) => {
    test.skip(!hasCredentials, SKIP_NO_CREDENTIALS)

    await page.goto("/audit")

    await expect(page.getByText(/événement/).first()).toBeVisible()
  })
})