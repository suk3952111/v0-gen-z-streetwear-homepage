import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { ProductReviewSortBy } from "@/features/products/types/review"

export const getProductReviewsQueryBuilder = (
  supabaseClient: SupabaseClient<Database>,
  productId: string,
  sortBy: ProductReviewSortBy,
) => {
  let query: any = (supabaseClient.from("reviews") as any)
    .select(
      "id, user_id, rating, title, content, is_verified_purchase, helpful_count, created_at, user:users(full_name, avatar_url)",
    )
    .eq("product_id", productId)
    .eq("is_published", true)

  switch (sortBy) {
    case "highest":
      query = query.order("rating", { ascending: false })
      break
    case "lowest":
      query = query.order("rating", { ascending: true })
      break
    case "helpful":
      query = query.order("helpful_count", { ascending: false })
      break
    default:
      query = query.order("created_at", { ascending: false })
      break
  }

  return query.order("created_at", { ascending: false })
}

