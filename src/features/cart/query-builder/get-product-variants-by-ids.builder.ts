import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

export const getProductVariantsByIdsQueryBuilder = (
  supabaseClient: SupabaseClient<Database>,
  variantIds: string[],
) => {
  return (supabaseClient.from("product_variants") as any).select("id, size").in("id", variantIds)
}

