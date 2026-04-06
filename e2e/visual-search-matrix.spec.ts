import { expect, test } from "@playwright/test"
import path from "node:path"

const cases = [
  { label: "TOPS", file: "tops-query.jpg" },
  { label: "OUTER", file: "outer-query.jpg" },
  { label: "BOTTOMS", file: "bottoms-query.jpg" },
  { label: "ACC", file: "acc-query.jpg" },
]

test("ai visual search matrix across apparel and accessories", async ({ page }) => {
  await page.goto("/shop")

  for (const testCase of cases) {
    await page.getByRole("button", { name: /AI STYLE FINDER/i }).click()

    const dialog = page.getByRole("dialog", { name: /AI VISUAL SEARCH/i })
    await expect(dialog).toBeVisible()

    const imagePath = path.resolve(process.cwd(), "tmp", testCase.file)
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

    console.log(`VISUAL_SEARCH_${testCase.label}=` + JSON.stringify(titles))

    await dialog.getByLabel("Upload new image").click()
    await page.getByRole("button", { name: /Close modal/i }).click()
  }
})
