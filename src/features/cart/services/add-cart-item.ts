import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"
import { getCartItemByUserAndProductQueryBuilder } from "@/features/cart/query-builder/get-cart-item-by-user-and-product.builder"
import { getProductBySlugQueryBuilder } from "@/features/cart/query-builder/get-product-by-slug.builder"
import { getProductVariantByProductAndSizeQueryBuilder } from "@/features/cart/query-builder/get-product-variant-by-product-and-size.builder"
import { insertCartItemQueryBuilder } from "@/features/cart/query-builder/insert-cart-item.builder"
import { updateCartItemQuantityQueryBuilder } from "@/features/cart/query-builder/update-cart-item-quantity.builder"

export const addCartItem = async (
  supabaseClient: SupabaseClient<Database>,
  userId: string,
  productSlug: string,
  quantity: number,
  size?: string,
) => {
  const safeQuantity = Math.max(1, quantity)

  const { data: productRow, error: productError } = await getProductBySlugQueryBuilder(
    supabaseClient,
    productSlug,
  )
  if (productError) {
    throw new Error(`Cart 상품 조회 실패: ${productError.message}`)
  }
  const product = productRow as { id: string } | null
  if (!product?.id) {
    throw new Error("Cart 상품을 찾을 수 없습니다")
  }

  let variantId: string | null = null
  if (size) {
    const { data: variantRow, error: variantError } = await getProductVariantByProductAndSizeQueryBuilder(
      supabaseClient,
      product.id,
      size,
    )
    if (variantError) {
      throw new Error(`Cart 사이즈 조회 실패: ${variantError.message}`)
    }
    const variant = variantRow as { id: string } | null
    if (!variant?.id && size !== "ONE SIZE") {
      throw new Error("선택한 사이즈를 찾을 수 없습니다")
    }
    variantId = variant?.id ?? null
  }

  const { data: existingRow, error: existingError } = await getCartItemByUserAndProductQueryBuilder(
    supabaseClient,
    userId,
    product.id,
    variantId,
  )
  if (existingError) {
    throw new Error(`Cart 기존 항목 조회 실패: ${existingError.message}`)
  }

  const existing = existingRow as { id: string; quantity: number } | null
  if (existing?.id) {
    const nextQuantity = Math.max(1, Number(existing.quantity ?? 0) + safeQuantity)
    const { error: updateError } = await updateCartItemQuantityQueryBuilder(
      supabaseClient,
      existing.id,
      userId,
      nextQuantity,
    )
    if (updateError) {
      throw new Error(`Cart 수량 업데이트 실패: ${updateError.message}`)
    }
    return
  }

  const { error: insertError } = await insertCartItemQueryBuilder(
    supabaseClient,
    userId,
    product.id,
    variantId,
    safeQuantity,
  )
  if (insertError) {
    throw new Error(`Cart 항목 추가 실패: ${insertError.message}`)
  }
}
