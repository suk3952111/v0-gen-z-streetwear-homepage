"use client"

import { APP_URLS } from "@/constants/url"
import { createSupabaseClient } from "@/lib/supabase/client"

export function getOAuthErrorKeyFromMessage(message: string): string {
  const normalizedMessage = message.toLowerCase()

  if (normalizedMessage.includes("popup") && normalizedMessage.includes("close")) {
    return "oauth_canceled"
  }
  if (normalizedMessage.includes("provider is not enabled")) {
    return "oauth_provider_disabled"
  }
  if (normalizedMessage.includes("access_denied")) {
    return "oauth_access_denied"
  }

  return "oauth_failed"
}

export async function signInWithGoogleOAuth(): Promise<string | null> {
  const supabase = createSupabaseClient()
  const redirectTo = `${window.location.origin}${APP_URLS.authCallback}?next=${encodeURIComponent(APP_URLS.home)}`

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
    },
  })

  if (!error) {
    return null
  }

  return getOAuthErrorKeyFromMessage(error.message)
}
