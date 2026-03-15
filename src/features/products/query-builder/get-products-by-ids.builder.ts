import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

export const getProductsByIdsQueryBuilder = (
  supabaseClient: SupabaseClient<Database>,
  productIds: string[],
) => {
  return (supabaseClient.from("products") as any)
    .select("id, slug")
    .in("id", productIds)
    .eq("is_published", true)
    .eq("is_deleted", false)
}

