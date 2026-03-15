import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

export const getProductsBySlugsQueryBuilder = (
  supabaseClient: SupabaseClient<Database>,
  slugs: string[],
) => {
  return supabaseClient.from("products").select("id, slug").in("slug", slugs)
}
