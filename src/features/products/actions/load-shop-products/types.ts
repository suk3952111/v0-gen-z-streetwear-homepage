import type { ShopProductsPage } from "@/features/products/types/shop"

export type LoadShopProductsActionState = {
  success: boolean
  data: ShopProductsPage
}
