import { test, expect } from "@playwright/test"
import { hasCredentials, SKIP_NO_CREDENTIALS } from "./support/env"

test.describe("UX / responsive — surfaces vérifiables (DEV)", () => {
  test("bascule entre thème clair et sombre", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Test spécifique au viewport desktop.")
    test.skip(!hasCredentials, SKIP_NO_CREDENTIALS)

    await page.goto("/settings")

    const html = page.locator("html")
    const light = page.getByRole("radio", { name: "Clair" })
    const dark = page.getByRole("radio", { name: "Sombre" })

    await light.click()
    await expect(html).not.toHaveClass(/dark/)

    await dark.click()
    await expect(html).toHaveClass(/dark/)
    await expect(dark).toHaveAttribute("aria-checked", "true")
  })

  test("sur viewport mobile, le menu latéral s'ouvre et permet la navigation", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-chromium", "Test spécifique au viewport mobile.")
    test.skip(!hasCredentials, SKIP_NO_CREDENTIALS)

    await page.goto("/")

    await expect(page.getByRole("button", { name: "Ouvrir la navigation" })).toBeVisible()
    await page.getByRole("button", { name: "Ouvrir la navigation" }).click()

    await expect(page.getByRole("link", { name: "Organizations" })).toBeVisible()
    await page.getByRole("link", { name: "Organizations" }).click()

    await expect(page).toHaveURL(/\/organizations/)
  })
})