import { expect, test } from "@playwright/test"

test("헤더 ABOUT 링크로 정보 페이지 이동", async ({ page }) => {
  await page.goto("/")
  await page.getByRole("link", { name: "ABOUT" }).first().click()

  await expect(page).toHaveURL(/\/about$/)
  await expect(page.getByRole("heading", { name: "ABOUT" })).toBeVisible()
})

test("빈 장바구니 상태와 쇼핑 CTA가 보인다", async ({ page }) => {
  await page.goto("/cart")

  await expect(page).toHaveURL(/\/cart$/)
  await expect(page.getByText("YOUR VIBE BAG IS EMPTY")).toBeVisible()

  const startShoppingLink = page.getByRole("link", { name: "START SHOPPING" })
  await expect(startShoppingLink).toBeVisible()
  await startShoppingLink.click()
  await expect(page).toHaveURL(/\/shop$/)
})
