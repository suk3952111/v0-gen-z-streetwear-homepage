import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

export const getUserRoleByIdQueryBuilder = (
  supabaseClient: SupabaseClient<Database>,
  id: string,
) => {
  return supabaseClient.from("users").select("role").eq("id", id).maybeSingle()
}
