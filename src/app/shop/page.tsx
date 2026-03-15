import { loadShopInitialAction } from "@/features/products/actions/load-shop-initial"
import { ShopView } from "@/features/products/components/list"

export default async function ShopPage() {
  const initial = await loadShopInitialAction()
  return <ShopView initialData={initial.data} />
}
