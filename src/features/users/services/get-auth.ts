import type { Database } from '@/types/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'

export const getAuth = async (supabaseClient: SupabaseClient<Database>) => {
  const {
    data: { user },
    error,
  } = await supabaseClient.auth.getUser()

  if (error) {
    throw new Error(`인증 정보를 가져오는데 실패했습니다: ${error.message}`)
  }

  return user
}
