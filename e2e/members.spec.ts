import { test, expect } from "@playwright/test"
import {
  hasCredentials,
  hasTestOrganization,
  E2E_TEST_ORG_ID,
  SKIP_NO_CREDENTIALS,
  SKIP_NO_ORG,
} from "./support/env"

const LAST_OWNER_TITLE = /Il n.est pas possible de r.trograder le dernier propri.taire/

test.describe("Membres / Rôles — contrôles dans une organisation (DEV)", () => {
  test("la gestion des membres est visible sur une organisation autorisée", async ({ page }) => {
    test.skip(!hasCredentials, SKIP_NO_CREDENTIALS)
    test.skip(!hasTestOrganization, SKIP_NO_ORG)

    await page.goto(`/organizations/${E2E_TEST_ORG_ID}`)

    await expect(page.getByRole("heading", { name: /^Membres/ })).toBeVisible()
  })

  test("le dernier propriétaire ne peut pas être rétrogradé", async ({ page }) => {
    test.skip(!hasCredentials, SKIP_NO_CREDENTIALS)
    test.skip(!hasTestOrganization, SKIP_NO_ORG)

    await page.goto(`/organizations/${E2E_TEST_ORG_ID}`)

    const ownerControls = page.getByTitle(LAST_OWNER_TITLE)
    if ((await ownerControls.count()) === 0) {
      test.skip(
        true,
        "Aucun membre 'dernier propriétaire' dans la DEV configurée : protection non observable.",
      )
    }

    await expect(ownerControls).toBeDisabled()
  })
})