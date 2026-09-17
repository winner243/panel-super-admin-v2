import { test, expect } from "@playwright/test"
import {
  hasCredentials,
  hasTestOrganization,
  E2E_TEST_ORG_ID,
  E2E_RUN_MUTATIONS,
  SKIP_NO_CREDENTIALS,
  SKIP_NO_ORG,
  SKIP_NO_MUTATIONS,
} from "./support/env"

const NON_AUTHORIZED_ORG_ID = "00000000-0000-4000-8000-000000000000"

test.describe("Organizations — consultation et accès (DEV)", () => {
  test("la liste des organisations est accessible", async ({ page }) => {
    test.skip(!hasCredentials, SKIP_NO_CREDENTIALS)

    await page.goto("/organizations")

    await expect(page.getByRole("heading", { name: "Organisations" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Nouvelle organisation" })).toBeVisible()
  })

  test("une organisation autorisée est consultable", async ({ page }) => {
    test.skip(!hasCredentials, SKIP_NO_CREDENTIALS)
    test.skip(!hasTestOrganization, SKIP_NO_ORG)

    await page.goto(`/organizations/${E2E_TEST_ORG_ID}`)

    await expect(page.getByRole("heading", { name: /^Membres/ })).toBeVisible()
  })

  test("une organisation non autorisée renvoie 404", async ({ page }) => {
    test.skip(!hasCredentials, SKIP_NO_CREDENTIALS)

    const response = await page.goto(`/organizations/${NON_AUTHORIZED_ORG_ID}`)

    expect(response?.status()).toBe(404)
  })

  test("création d'une organisation (écriture DEV)", async ({ page }) => {
    test.skip(!hasCredentials, SKIP_NO_CREDENTIALS)
    test.skip(!E2E_RUN_MUTATIONS, SKIP_NO_MUTATIONS)

    const slug = `e2e-org-${Date.now()}`

    await page.goto("/organizations")
    await page.getByRole("button", { name: "Nouvelle organisation" }).click()

    const nameField = page.getByLabel(/Nom de l.organisation/)
    const slugField = page.getByLabel("Slug", { exact: true })

    await nameField.fill("Organisation E2E")
    await slugField.fill(slug)
    await page.getByRole("button", { name: /Créer l.organisation/ }).click()

    await expect(page).toHaveURL(/\/organizations\/[0-9a-f-]{36}$/)
    await expect(page.getByRole("heading", { name: "Organisation E2E" })).toBeVisible()
  })
})