import { expect, test } from "@playwright/test"
import path from "node:path"

test("ai visual search returns product matches for a real product image", async ({ page }) => {
  const imagePath = path.resolve(process.cwd(), "tmp", "visual-search-query.jpg")

  await page.goto("/shop")
  await page.getByRole("button", { name: /AI STYLE FINDER/i }).click()

  const dialog = page.getByRole("dialog", { name: /AI VISUAL SEARCH/i })
  await expect(dialog).toBeVisible()

  await dialog.getByLabel("Upload image").setInputFiles(imagePath)

  await expect(dialog.getByText(/SCANNING VIBE/i)).toBeVisible()
  await expect(dialog.getByText(/MATCHING RESULTS/i)).toBeVisible({ timeout: 30000 })

  const cards = dialog.locator('a[href^="/product/"]')
  await expect(cards.first()).toBeVisible({ timeout: 30000 })

  const count = await cards.count()
  const titles: string[] = []
  for (let index = 0; index < Math.min(count, 5); index += 1) {
    const title = await cards.nth(index).locator("h4").textContent()
    titles.push((title ?? "").trim())
  }

  console.log("VISUAL_SEARCH_TOP_RESULTS=" + JSON.stringify(titles))
})
