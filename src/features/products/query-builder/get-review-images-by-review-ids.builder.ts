import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

export const getReviewImagesByReviewIdsQueryBuilder = (
  supabaseClient: SupabaseClient<Database>,
  reviewIds: string[],
) => {
  return supabaseClient
    .from("review_images")
    .select("review_id, image_url, display_order")
    .in("review_id", reviewIds)
    .order("display_order", { ascending: true })
}
