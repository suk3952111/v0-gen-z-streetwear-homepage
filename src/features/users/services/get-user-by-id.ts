import type { Database } from '@/types/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getUserByIdQueryBuilder } from '@/features/users/query-builder/get-user-by-id.builder'

export const getUserById = async (
  supabaseClient: SupabaseClient<Database>,
  id: string,
) => {
  const { data, error } = await getUserByIdQueryBuilder(supabaseClient, id)

  if (error) {
    throw new Error(`User를 불러오는데 실패했습니다: ${error.message}`)
  }

  return data
}
