import { test, expect } from "@playwright/test"
import {
  E2E_TEST_EMAIL,
  E2E_TEST_PASSWORD,
  hasCredentials,
  SKIP_NO_CREDENTIALS,
} from "./support/env"

// Ce fichier effectue ses propres connexions : il part systématiquement d'un
// état déconnecté pour driver le formulaire réel de connexion.
test.use({ storageState: { cookies: [], origins: [] } })

test.describe("Auth — connexion / déconnexion (DEV)", () => {
  test("les identifiants invalides affichent une erreur", async ({ page }) => {
    test.skip(!hasCredentials, SKIP_NO_CREDENTIALS)

    await page.goto("/auth/login")
    await page.locator("#login-email").fill("e2e-invalide@exemple.invalid")
    await page.locator("#login-password").fill("mot-de-passe-invalide")
    await page.getByRole("button", { name: "Se connecter" }).click()

    await expect(page.getByRole("alert")).toBeVisible()
    await expect(page.getByRole("alert")).toContainText("Identifiants incorrects.")
  })

  test("connexion réussie puis redirection vers le tableau de bord", async ({ page }) => {
    test.skip(!hasCredentials, SKIP_NO_CREDENTIALS)

    await page.goto("/auth/login")
    await page.locator("#login-email").fill(E2E_TEST_EMAIL as string)
    await page.locator("#login-password").fill(E2E_TEST_PASSWORD as string)
    await page.getByRole("button", { name: "Se connecter" }).click()

    await expect(page).toHaveURL(`${new URL(page.url()).origin}/`)
    await expect(page.getByRole("button", { name: "Menu du compte" })).toBeVisible()
  })

  test("déconnexion : retour à la connexion et route de nouveau protégée", async ({ page }) => {
    test.skip(!hasCredentials, SKIP_NO_CREDENTIALS)

    await page.goto("/auth/login")
    await page.locator("#login-email").fill(E2E_TEST_EMAIL as string)
    await page.locator("#login-password").fill(E2E_TEST_PASSWORD as string)
    await page.getByRole("button", { name: "Se connecter" }).click()
    await expect(page).toHaveURL(`${new URL(page.url()).origin}/`)
    await expect(page.getByRole("button", { name: "Menu du compte" })).toBeVisible()

    await page.getByRole("button", { name: "Menu du compte" }).click()
    await page.getByText("Déconnexion", { exact: true }).click()
    await expect(page).toHaveURL(/\/auth\/login/)

    await page.goto("/")
    await expect(page).toHaveURL(/\/auth\/login/)
    await expect(page.getByRole("heading", { name: "Connexion" })).toBeVisible()
  })

  test("une session active redirige /auth/login vers le tableau de bord", async ({ page }) => {
    test.skip(!hasCredentials, SKIP_NO_CREDENTIALS)

    await page.goto("/auth/login")
    await page.locator("#login-email").fill(E2E_TEST_EMAIL as string)
    await page.locator("#login-password").fill(E2E_TEST_PASSWORD as string)
    await page.getByRole("button", { name: "Se connecter" }).click()
    await expect(page).toHaveURL(`${new URL(page.url()).origin}/`)

    await page.goto("/auth/login")
    await expect(page).toHaveURL(`${new URL(page.url()).origin}/`)
  })
})