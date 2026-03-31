import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"
import { getProductsBySlugsQueryBuilder } from "@/features/products/query-builder/get-products-by-slugs.builder"
import { buildShopProductItems, type ShopProductRow } from "@/features/products/services/build-shop-product-items"
import type { ShopProductItem } from "@/features/products/types/shop"

export const getProductsBySlugs = async (
  supabaseClient: SupabaseClient<Database>,
  slugs: string[],
): Promise<ShopProductItem[]> => {
  if (slugs.length === 0) return []

  const { data: productRowsData, error: productRowsError } = await getProductsBySlugsQueryBuilder(
    supabaseClient,
    slugs,
  )

  if (productRowsError) {
    throw new Error(`Failed to fetch products: ${productRowsError.message}`)
  }

  const productRows = (productRowsData ?? []) as ShopProductRow[]
  if (productRows.length === 0) return []

  const items = await buildShopProductItems(supabaseClient, productRows)
  const itemBySlug = new Map(items.map((item) => [item.id, item]))

  return slugs.map((slug) => itemBySlug.get(slug)).filter((item): item is ShopProductItem => !!item)
}
