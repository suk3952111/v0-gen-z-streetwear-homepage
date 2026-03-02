import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

export const getCategoriesQueryBuilder = (supabaseClient: SupabaseClient<Database>) => {
  return supabaseClient.from("categories").select("id, name, slug").eq("is_active", true).order("display_order")
}
