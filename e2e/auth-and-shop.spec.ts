import { expect, test } from "@playwright/test"

test("로그인 페이지 필드와 링크가 노출된다", async ({ page }) => {
  await page.goto("/login")

  const main = page.locator("main").first()

  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole("heading", { name: /IDENTITY\s*CHECK/i })).toBeVisible()
  await expect(main.getByPlaceholder("YOUR@EMAIL.COM").first()).toBeVisible()
  await expect(main.locator('input[type="password"]').first()).toBeVisible()
  await expect(page.getByRole("link", { name: "FORGOT PASSWORD?" })).toBeVisible()
})

test("샵 페이지 검색 입력과 결과 카운트가 보인다", async ({ page }) => {
  await page.goto("/shop")

  await expect(page).toHaveURL(/\/shop$/)
  await expect(page.getByPlaceholder("SEARCH PRODUCTS OR #TAGS...").first()).toBeVisible()
  await expect(page.getByText(/ITEMS FOUND/)).toBeVisible()
})
