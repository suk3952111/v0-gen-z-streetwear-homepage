import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

export const matchProductsByProductEmbeddingQueryBuilder = (
  supabaseClient: SupabaseClient<Database>,
  sourceProductId: string,
  matchCount: number,
) => {
  return supabaseClient.rpc("match_products_by_product_embedding", {
    source_product_id: sourceProductId,
    match_count: matchCount,
  })
}
