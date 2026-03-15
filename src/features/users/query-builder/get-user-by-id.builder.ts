import type { Database } from '@/types/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'

export const getUserByIdQueryBuilder = (
  supabaseClient: SupabaseClient<Database>,
  id: string,
) => {
  const query = supabaseClient
    .from('users')
    .select('id, email, full_name, role, is_active, created_at, updated_at, last_sign_in_at')
    .eq('id', id)
    .single()

  return query
}
