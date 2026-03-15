import { AppShellClient } from "@/components/layout/app-shell-client"
import { getAuth, getUserById } from "@/features/users/services"
import { createSupabaseServer } from "@/lib/supabase/server"

type ShellUser = {
  id: string
  fullName: string | null
  role: string | null
} | null

export async function AppShell({ children }: { children: React.ReactNode }) {
  let currentUser: ShellUser = null

  try {
    const supabase = await createSupabaseServer()
    const user = await getAuth(supabase)

    if (user) {
      const userData = await getUserById(supabase, user.id)
      currentUser = {
        id: user.id,
        fullName: userData?.full_name ?? null,
        role: userData?.role ?? null,
      }
    }
  } catch {
    currentUser = null
  }

  return <AppShellClient currentUser={currentUser}>{children}</AppShellClient>
}
