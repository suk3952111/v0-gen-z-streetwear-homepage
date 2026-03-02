import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"
import { getCartItemsByUserIdQueryBuilder } from "@/features/cart/query-builder/get-cart-items-by-user-id.builder"
import { getProductsByIdsQueryBuilder } from "@/features/cart/query-builder/get-products-by-ids.builder"
import { getProductVariantsByIdsQueryBuilder } from "@/features/cart/query-builder/get-product-variants-by-ids.builder"

export type CartEntryFromDb = {
  key: string
  productId: string
  quantity: number
  size: string
  dbId: string
}

export const getCartItemsByUserId = async (
  supabaseClient: SupabaseClient<Database>,
  userId: string,
) => {
  const { data, error } = await getCartItemsByUserIdQueryBuilder(supabaseClient, userId)
  if (error) {
    throw new Error(`Cart 조회 실패: ${error.message}`)
  }

  const cartRows = (data ?? []) as Array<{
    id: string
    product_id: string
    variant_id: string | null
    quantity: number
  }>
  if (cartRows.length === 0) return [] as CartEntryFromDb[]

  const productDbIds = cartRows.map((row) => row.product_id)
  const { data: products, error: productsError } = await getProductsByIdsQueryBuilder(
    supabaseClient,
    productDbIds,
  )
  if (productsError) {
    throw new Error(`Cart 상품 매핑 조회 실패: ${productsError.message}`)
  }

  const productRows = (products ?? []) as Array<{ id: string; slug: string }>
  const slugByDbId = new Map(productRows.map((p) => [p.id, p.slug]))

  const variantIds = [...new Set(cartRows.map((row) => row.variant_id).filter((id): id is string => !!id))]
  const sizeByVariantId = new Map<string, string>()
  if (variantIds.length > 0) {
    const { data: variants, error: variantsError } = await getProductVariantsByIdsQueryBuilder(
      supabaseClient,
      variantIds,
    )
    if (variantsError) {
      throw new Error(`Cart 사이즈 매핑 조회 실패: ${variantsError.message}`)
    }

    const variantRows = (variants ?? []) as Array<{ id: string; size: string }>
    variantRows.forEach((variant) => {
      sizeByVariantId.set(variant.id, variant.size)
    })
  }

  return cartRows
    .map((row) => {
      const productSlug = slugByDbId.get(row.product_id)
      if (!productSlug) return null
      return {
        key: row.id,
        productId: productSlug,
        quantity: row.quantity,
        size: row.variant_id ? (sizeByVariantId.get(row.variant_id) ?? "ONE SIZE") : "ONE SIZE",
        dbId: row.id,
      }
    })
    .filter((row): row is CartEntryFromDb => row !== null)
}
