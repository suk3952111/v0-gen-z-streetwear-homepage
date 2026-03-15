import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

export const matchProductsByImageEmbeddingQueryBuilder = (
  supabaseClient: SupabaseClient<Database>,
  queryEmbeddingLiteral: string,
  matchCount: number,
) => {
  return (supabaseClient as any).rpc("match_products_by_image_embedding", {
    query_embedding: queryEmbeddingLiteral,
    match_count: matchCount,
  })
}

