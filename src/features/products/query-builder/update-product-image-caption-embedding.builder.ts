import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

export const updateProductImageCaptionEmbeddingQueryBuilder = (
  supabaseClient: SupabaseClient<Database>,
  imageId: string,
  caption: string,
  embeddingLiteral: string,
) => {
  return (supabaseClient.from("product_images") as any)
    .update({
      caption,
      caption_embedding: embeddingLiteral,
      caption_updated_at: new Date().toISOString(),
    })
    .eq("id", imageId)
}

