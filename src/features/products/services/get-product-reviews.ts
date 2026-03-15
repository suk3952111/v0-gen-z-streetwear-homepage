import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"
import { getProductBySlugQueryBuilder } from "@/features/products/query-builder/get-product-by-slug.builder"
import { getProductReviewsQueryBuilder } from "@/features/products/query-builder/get-product-reviews.builder"
import { getReviewImagesByReviewIdsQueryBuilder } from "@/features/products/query-builder/get-review-images-by-review-ids.builder"
import type { ProductReview, ProductReviewSortBy } from "@/features/products/types/review"

export const getProductReviews = async (
  supabaseClient: SupabaseClient<Database>,
  productSlug: string,
  sortBy: ProductReviewSortBy,
): Promise<ProductReview[]> => {
  const { data: productRow, error: productError } = await getProductBySlugQueryBuilder(
    supabaseClient,
    productSlug,
  )
  if (productError) {
    throw new Error(`Failed to load product: ${productError.message}`)
  }

  const product = productRow as { id: string } | null
  if (!product?.id) return []

  const { data: reviewRowsData, error: reviewRowsError } = await getProductReviewsQueryBuilder(
    supabaseClient,
    product.id,
    sortBy,
  )
  if (reviewRowsError) {
    throw new Error(`Failed to load reviews: ${reviewRowsError.message}`)
  }

  const reviewRows = (reviewRowsData ?? []) as Array<{
    id: string
    user_id: string
    rating: number
    title: string | null
    content: string
    is_verified_purchase: boolean
    helpful_count: number
    created_at: string
    user?: { full_name?: string | null; avatar_url?: string | null } | null
  }>
  if (reviewRows.length === 0) return []

  const reviewIds = reviewRows.map((row) => row.id)
  const { data: imageRowsData, error: imageRowsError } = await getReviewImagesByReviewIdsQueryBuilder(
    supabaseClient,
    reviewIds,
  )
  if (imageRowsError) {
    throw new Error(`Failed to load review images: ${imageRowsError.message}`)
  }

  const imageRows = (imageRowsData ?? []) as Array<{
    review_id: string
    image_url: string
    display_order: number
  }>

  const imagesByReviewId = new Map<string, string[]>()
  imageRows.forEach((row) => {
    const list = imagesByReviewId.get(row.review_id) ?? []
    list.push(row.image_url)
    imagesByReviewId.set(row.review_id, list)
  })

  return reviewRows.map((row) => ({
    id: row.id,
    user_id: row.user_id,
    username: row.user?.full_name?.trim() || "VIBE_USER",
    avatar_url: row.user?.avatar_url ?? undefined,
    rating: Number(row.rating ?? 0),
    title: row.title ?? "",
    content: row.content,
    images: imagesByReviewId.get(row.id) ?? [],
    is_verified_purchase: Boolean(row.is_verified_purchase),
    helpful_count: Number(row.helpful_count ?? 0),
    created_at: row.created_at,
  }))
}

