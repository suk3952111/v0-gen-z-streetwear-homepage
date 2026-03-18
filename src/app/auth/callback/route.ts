import { NextResponse } from 'next/server'

import { APP_URLS } from '@/constants/url'
import { ensureUserProfile } from '@/features/users/services'
import { createSupabaseServer } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? APP_URLS.home
  console.log('[auth/callback] start', { hasCode: Boolean(code), next })

  const redirectPath = next.startsWith('/') ? next : APP_URLS.home
  const redirectUrl = new URL(redirectPath, requestUrl.origin)

  if (!code) {
    console.log('[auth/callback] missing code -> redirect login')
    return NextResponse.redirect(new URL(APP_URLS.login, requestUrl.origin))
  }

  const supabase = await createSupabaseServer()
  await supabase.auth.exchangeCodeForSession(code)
  console.log('[auth/callback] exchangeCodeForSession success')
  const {
    data: { user },
  } = await supabase.auth.getUser()
  console.log('[auth/callback] getUser', { hasUser: Boolean(user), userId: user?.id ?? null })

  if (user) {
    try {
      await ensureUserProfile(supabase, user)
      console.log('[auth/callback] ensureUserProfile success', { userId: user.id })
    } catch {
      console.error('[auth/callback] ensureUserProfile failed', { userId: user.id })
      // Continue redirect flow; client providers can fallback to local storage mode.
    }
  }

  console.log('[auth/callback] redirect', { redirectPath })
  return NextResponse.redirect(redirectUrl)
}
