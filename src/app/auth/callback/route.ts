import { NextResponse } from 'next/server'

import { APP_URLS } from '@/constants/url'
import { ensureUserProfile } from '@/features/users/services'
import { createSupabaseServer } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? APP_URLS.home

  const redirectPath = next.startsWith('/') ? next : APP_URLS.home
  const redirectUrl = new URL(redirectPath, requestUrl.origin)

  if (!code) {
    return NextResponse.redirect(new URL(APP_URLS.login, requestUrl.origin))
  }

  const supabase = await createSupabaseServer()
  await supabase.auth.exchangeCodeForSession(code)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    try {
      await ensureUserProfile(supabase, user)
    } catch {
      // Continue redirect flow; client providers can fallback to local storage mode.
    }
  }

  return NextResponse.redirect(redirectUrl)
}
