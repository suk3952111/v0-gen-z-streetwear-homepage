import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"
import { getUserRoleByIdQueryBuilder } from "@/features/users/query-builder/get-user-role-by-id.builder"

export const getUserRoleById = async (
  supabaseClient: SupabaseClient<Database>,
  id: string,
) => {
  const { data, error } = await getUserRoleByIdQueryBuilder(supabaseClient, id)

  if (error) {
    throw new Error(`User role 조회 실패: ${error.message}`)
  }

  const roleData = data as { role: string | null } | null
  return roleData?.role ?? null
}
