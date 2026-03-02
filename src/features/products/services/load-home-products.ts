import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"
import { loadShopProductsPage } from "@/features/products/services/load-shop-products-page"
import type { ShopProductItem } from "@/features/products/types/shop"

export const loadHomeProducts = async (
  supabaseClient: SupabaseClient<Database>,
): Promise<ShopProductItem[]> => {
  const page = await loadShopProductsPage(supabaseClient, {
    categorySlug: "all",
    tagSlugs: [],
    searchQuery: "",
    offset: 0,
    limit: 8,
  })
  return page.items
}
