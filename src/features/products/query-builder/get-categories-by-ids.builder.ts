import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

export const getCategoriesByIdsQueryBuilder = (
  supabaseClient: SupabaseClient<Database>,
  categoryIds: string[],
) => {
  return supabaseClient.from("categories").select("id, name, slug").in("id", categoryIds)
}
