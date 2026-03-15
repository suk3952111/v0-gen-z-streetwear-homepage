import type { ShopProductItem } from "@/features/products/types/shop"

export type RecommendSimilarStyleActionState = {
  success: boolean
  data: ShopProductItem[]
}

