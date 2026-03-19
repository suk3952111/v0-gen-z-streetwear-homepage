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
  const normalizedSize = (size ?? "").trim().toUpperCase()

  const { data: productRow, error: productError } = await getProductBySlugQueryBuilder(
    supabaseClient,
    productSlug,
  )
  if (productError) {
    throw new Error(`Failed to fetch product for cart: ${productError.message}`)
  }

  const product = productRow as { id: string } | null
  if (!product?.id) {
    throw new Error("Product not found")
  }

  let variantId: string | null = null
  if (normalizedSize.length > 0) {
    const { data: variantRow, error: variantError } = await getProductVariantByProductAndSizeQueryBuilder(
      supabaseClient,
      product.id,
      normalizedSize,
    )

    if (variantError) {
      throw new Error(`Failed to fetch product variant: ${variantError.message}`)
    }

    const variant = variantRow as { id: string } | null
    if (!variant?.id && normalizedSize !== "ONE SIZE") {
      throw new Error("Selected size is unavailable")
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
    throw new Error(`Failed to fetch existing cart item: ${existingError.message}`)
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
      throw new Error(`Failed to update cart quantity: ${updateError.message}`)
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
    throw new Error(`Failed to insert cart item: ${insertError.message}`)
  }
}
