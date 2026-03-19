import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

export const getBrandsQueryBuilder = (supabaseClient: SupabaseClient<Database>) => {
  return supabaseClient
    .from("brands")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("name", { ascending: true })
}

