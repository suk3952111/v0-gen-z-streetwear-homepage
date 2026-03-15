import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

export const listProductImagesForEmbeddingQueryBuilder = (
  supabaseClient: SupabaseClient<Database>,
  batchCount: number,
) => {
  return supabaseClient.rpc("list_product_images_for_embedding", {
    batch_count: batchCount,
  })
}
