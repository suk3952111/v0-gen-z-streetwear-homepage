import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"
import { loadShopFilters } from "@/features/products/services/load-shop-filters"
import { loadShopProductsPage } from "@/features/products/services/load-shop-products-page"
import type { ShopInitialPayload } from "@/features/products/types/shop"

export const loadShopInitialData = async (
  supabaseClient: SupabaseClient<Database>,
): Promise<ShopInitialPayload> => {
  const [filters, page] = await Promise.all([
    loadShopFilters(supabaseClient),
    loadShopProductsPage(supabaseClient, {
      categorySlug: "all",
      brandSlug: "all",
      tagSlugs: [],
      searchQuery: "",
      offset: 0,
      limit: 16,
    }),
  ])

  return {
    categories: filters.categories,
    brands: filters.brands,
    tags: filters.tags,
    page,
  }
}
