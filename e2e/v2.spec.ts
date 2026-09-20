import { test, expect } from "@playwright/test"

const v2Routes = [
  { path: "/subscriptions", heading: "Subscriptions" },
  { path: "/payments", heading: "Payments" },
  { path: "/revenue", heading: "Revenue" },
  { path: "/analytics", heading: "Analytics" },
  { path: "/feature-flags", heading: "Feature Flags" },
  { path: "/notifications", heading: "Notifications" },
  { path: "/webhooks", heading: "Webhooks" },
  { path: "/api-keys", heading: "Clés API" },
  { path: "/system-health", heading: "Santé du système" },
  { path: "/jobs", heading: "Tâches" },
]

test.describe("V2 — Navigation", () => {
  for (const { path, heading } of v2Routes) {
    test(`la page ${path} est accessible et affiche le titre`, async ({ page }) => {
      await page.goto(path)

      await expect(
        page.getByRole("heading", { name: heading })
      ).toBeVisible()
    })
  }
})

test.describe("V2 — Auth guard", () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  for (const { path } of v2Routes) {
    test(`${path} redirige vers /auth/login sans session`, async ({ page }) => {
      await page.goto(path)
      await expect(page).toHaveURL(/\/auth\/login/)
    })
  }
})
