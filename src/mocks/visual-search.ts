import { products } from "@/lib/products"

export const mockVisualSearchTags = ["#Oversized", "#Neon", "#Street", "#Urban", "#Y2K", "#Cyber"]

export const getMockVisualSearchResults = () => {
  const shuffled = [...products].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, 6).map((product, index) => ({ ...product, aiMatch: 98 - index * 4 }))
}
