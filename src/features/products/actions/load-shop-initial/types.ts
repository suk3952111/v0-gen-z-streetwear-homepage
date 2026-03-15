import type { ShopInitialPayload } from "@/features/products/types/shop"

export type LoadShopInitialActionState = {
  success: boolean
  data: ShopInitialPayload
}
