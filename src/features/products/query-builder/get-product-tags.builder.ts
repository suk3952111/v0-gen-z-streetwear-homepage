import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

export const getProductTagsQueryBuilder = (supabaseClient: SupabaseClient<Database>) => {
  return supabaseClient.from("product_tags").select("id, name, slug").order("name")
}
