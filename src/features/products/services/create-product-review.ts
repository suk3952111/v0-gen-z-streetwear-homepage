import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"
import { getProductBySlugQueryBuilder } from "@/features/products/query-builder/get-product-by-slug.builder"
import { insertReviewQueryBuilder } from "@/features/products/query-builder/insert-review.builder"
import { insertReviewImagesQueryBuilder } from "@/features/products/query-builder/insert-review-images.builder"
import type { ProductReview } from "@/features/products/types/review"

type CreateProductReviewInput = {
  productSlug: string
  userId: string
  rating: number
  title?: string
  content: string
  imageUrls?: string[]
}

const findVerifiedPurchase = async (
  supabaseClient: SupabaseClient<Database>,
  userId: string,
  productId: string,
) => {
  const { data: orderRowsData, error: orderRowsError } = await (supabaseClient
    .from("orders") as any)
    .select("id")
    .eq("user_id", userId)
    .in("status", ["confirmed", "shipped", "delivered"])
    .limit(200)

  if (orderRowsError) {
    throw new Error(`Failed to load orders: ${orderRowsError.message}`)
  }

  const orderRows = (orderRowsData ?? []) as Array<{ id: string }>
  const orderIds = orderRows.map((row) => row.id)
  if (orderIds.length === 0) return false

  const { data: itemRowsData, error: itemRowsError } = await (supabaseClient
    .from("order_items") as any)
    .select("id")
    .eq("product_id", productId)
    .in("order_id", orderIds)
    .limit(1)

  if (itemRowsError) {
    throw new Error(`Failed to check purchase: ${itemRowsError.message}`)
  }

  const itemRows = (itemRowsData ?? []) as Array<{ id: string }>
  return itemRows.length > 0
}

export const createProductReview = async (
  supabaseClient: SupabaseClient<Database>,
  input: CreateProductReviewInput,
): Promise<ProductReview> => {
  const { data: productRow, error: productError } = await getProductBySlugQueryBuilder(
    supabaseClient,
    input.productSlug,
  )
  if (productError) {
    throw new Error(`Failed to load product: ${productError.message}`)
  }

  const product = productRow as { id: string } | null
  if (!product?.id) {
    throw new Error("Product not found")
  }

  const isVerifiedPurchase = await findVerifiedPurchase(supabaseClient, input.userId, product.id)
  const safeTitle = input.title?.trim() ? input.title.trim() : null
  const safeContent = input.content.trim()

  const { data: reviewRow, error: reviewError } = await insertReviewQueryBuilder(supabaseClient, {
    product_id: product.id,
    user_id: input.userId,
    rating: input.rating,
    title: safeTitle,
    content: safeContent,
    is_verified_purchase: isVerifiedPurchase,
  })
  if (reviewError) {
    throw new Error(`Failed to create review: ${reviewError.message}`)
  }

  const review = reviewRow as
    | {
        id: string
        user_id: string
        rating: number
        title: string | null
        content: string
        is_verified_purchase: boolean
        helpful_count: number
        created_at: string
      }
    | null

  if (!review?.id) {
    throw new Error("Failed to create review")
  }

  const safeImageUrls = (input.imageUrls ?? [])
    .map((url) => url.trim())
    .filter((url) => url.length > 0)
    .slice(0, 5)

  if (safeImageUrls.length > 0) {
    const payload = safeImageUrls.map((imageUrl, index) => ({
      review_id: review.id,
      image_url: imageUrl,
      display_order: index,
    }))
    const { error: imageInsertError } = await insertReviewImagesQueryBuilder(supabaseClient, payload)
    if (imageInsertError) {
      throw new Error(`Failed to save review images: ${imageInsertError.message}`)
    }
  }

  const { data: userRowData } = await (supabaseClient.from("users") as any)
    .select("full_name, avatar_url")
    .eq("id", input.userId)
    .maybeSingle()

  const userRow = userRowData as { full_name?: string | null; avatar_url?: string | null } | null

  return {
    id: review.id,
    user_id: review.user_id,
    username: userRow?.full_name?.trim() || "VIBE_USER",
    avatar_url: userRow?.avatar_url ?? undefined,
    rating: Number(review.rating ?? 0),
    title: review.title ?? "",
    content: review.content,
    images: safeImageUrls,
    is_verified_purchase: Boolean(review.is_verified_purchase),
    helpful_count: Number(review.helpful_count ?? 0),
    created_at: review.created_at,
  }
}

