'use server'

import { redirect } from 'next/navigation'

import { APP_URLS } from '@/constants/url'
import { createSupabaseServer } from '@/lib/supabase/server'

export async function logoutAction() {
  const supabase = await createSupabaseServer()
  await supabase.auth.signOut()
  redirect(APP_URLS.home)
}
