import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

type InsertReviewImagePayload = {
  review_id: string
  image_url: string
  display_order: number
}

export const insertReviewImagesQueryBuilder = (
  supabaseClient: SupabaseClient<Database>,
  payload: InsertReviewImagePayload[],
) => {
  return (supabaseClient.from("review_images") as any).insert(payload)
}

