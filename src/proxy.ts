import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const AUTH_REQUIRED_PREFIXES = ["/account", "/wishlist", "/cart", "/admin"] as const
const ADMIN_REQUIRED_PREFIXES = ["/admin"] as const
const LOGIN_PATH = "/login"
const HOME_PATH = "/"
const PLATFORM_ADMIN_ROLE = "platform_admin"

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

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
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
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const loginUrl = new URL(LOGIN_PATH, request.url)
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (!requiresAdmin) {
    return response
  }

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle()

  if (profile?.role !== PLATFORM_ADMIN_ROLE) {
    return NextResponse.redirect(new URL(HOME_PATH, request.url))
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
