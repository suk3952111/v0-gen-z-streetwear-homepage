import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

type InsertReviewPayload = {
  product_id: string
  user_id: string
  rating: number
  title: string | null
  content: string
  is_verified_purchase: boolean
}

export const insertReviewQueryBuilder = (
  supabaseClient: SupabaseClient<Database>,
  payload: InsertReviewPayload,
) => {
  return (supabaseClient.from("reviews") as any)
    .insert(payload)
    .select("id, user_id, rating, title, content, is_verified_purchase, helpful_count, created_at")
    .maybeSingle()
}

