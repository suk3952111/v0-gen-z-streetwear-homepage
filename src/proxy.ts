import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { APP_URLS } from "@/constants/url"
import { ADMIN_REQUIRED_PREFIXES, AUTH_REQUIRED_PREFIXES, USER_ROLES } from "@/constants/auth"
import { getUserRoleById } from "@/features/users/services/get-user-role-by-id"
import { withSupabaseErrorLogging } from "@/lib/supabase/error-logging"

const LOGIN_PATH = APP_URLS.login
const HOME_PATH = APP_URLS.home

function matchesPrefix(pathname: string, prefixes: readonly string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  const requiresAuth = matchesPrefix(pathname, AUTH_REQUIRED_PREFIXES)
  const requiresAdmin = matchesPrefix(pathname, ADMIN_REQUIRED_PREFIXES)

  if (!requiresAuth) {
    return NextResponse.next()
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url))
  }

  let response = NextResponse.next({ request })

  const supabase = withSupabaseErrorLogging(createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  }), "server")

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    const loginUrl = new URL(LOGIN_PATH, request.url)
    const nextPath = `${pathname}${request.nextUrl.search}`
    loginUrl.searchParams.set("next", nextPath)
    return NextResponse.redirect(loginUrl)
  }

  if (!requiresAdmin) {
    return response
  }

  try {
    const role = await getUserRoleById(supabase, user.id)

    if (role !== USER_ROLES.platformAdmin) {
      return NextResponse.redirect(new URL(HOME_PATH, request.url))
    }
  } catch {
    return NextResponse.redirect(new URL(HOME_PATH, request.url))
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
