import { mkdirSync, writeFileSync } from "node:fs"
import { dirname } from "node:path"
import { test as setup, expect } from "@playwright/test"
import {
  E2E_BASE_URL,
  E2E_TEST_EMAIL,
  E2E_TEST_PASSWORD,
  hasCredentials,
  SKIP_NO_CREDENTIALS,
  STORAGE_STATE_PATH,
} from "../support/env"

setup("créer l'état de session authentifié (DEV uniquement)", async ({ page }) => {
  mkdirSync(dirname(STORAGE_STATE_PATH), { recursive: true })

  if (!hasCredentials) {
    writeFileSync(STORAGE_STATE_PATH, JSON.stringify({ cookies: [], origins: [] }), "utf-8")
    setup.skip(true, SKIP_NO_CREDENTIALS)
  }

  await page.goto("/auth/login")
  await page.locator("#login-email").fill(E2E_TEST_EMAIL as string)
  await page.locator("#login-password").fill(E2E_TEST_PASSWORD as string)
  await page.getByRole("button", { name: "Se connecter" }).click()

  await expect(page).toHaveURL(`${new URL(E2E_BASE_URL).origin}/`)
  await expect(page.getByRole("button", { name: "Menu du compte" })).toBeVisible()

  await page.context().storageState({ path: STORAGE_STATE_PATH })
})