import { expect, test } from "@playwright/test"

test("홈 페이지 핵심 요소가 렌더링된다", async ({ page }) => {
  await page.goto("/")

  await expect(page).toHaveTitle(/VIBE CHECK/i)
  await expect(page.getByRole("link", { name: /VIBE CHECK/i })).toBeVisible()
  await expect(page.getByRole("heading", { name: /VIBE\s*CHECK/i }).first()).toBeVisible()
  await expect(page.getByRole("link", { name: "DROPS" }).first()).toBeVisible()
})
