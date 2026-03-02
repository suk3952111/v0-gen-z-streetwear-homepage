import type { ShopProductItem } from "@/features/products/types/shop"

export type LoadHomeProductsActionState = {
  success: boolean
  data: ShopProductItem[]
}
