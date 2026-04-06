import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

export const updateProductImageCaptionEmbeddingQueryBuilder = (
  supabaseClient: SupabaseClient<Database>,
  imageId: string,
  caption: string,
  embeddingLiteral: string,
  aiAttributes?: Record<string, unknown> | null,
) => {
  return supabaseClient
    .from("product_images")
    .update({
      caption,
      caption_embedding: embeddingLiteral,
      caption_updated_at: new Date().toISOString(),
      ai_attributes: (aiAttributes ?? null) as never,
    })
    .eq("id", imageId)
}
