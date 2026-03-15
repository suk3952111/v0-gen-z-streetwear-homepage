import type { ShopProductItem } from "@/features/products/types/shop"

export type FindStyleByImageActionState = {
  success: boolean
  errorMessage?: string
  data: {
    detectedTags: string[]
    products: ShopProductItem[]
  }
}
