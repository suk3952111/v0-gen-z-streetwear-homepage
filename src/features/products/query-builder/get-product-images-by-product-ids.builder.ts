import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

export const getProductImagesByProductIdsQueryBuilder = (
  supabaseClient: SupabaseClient<Database>,
  productIds: string[],
) => {
  return supabaseClient
    .from("product_images")
    .select("product_id, image_url, is_primary, display_order")
    .in("product_id", productIds)
    .order("is_primary", { ascending: false })
    .order("display_order", { ascending: true })
}
