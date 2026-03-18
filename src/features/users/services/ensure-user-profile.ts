import type { Database } from "@/types/database.types"
import type { SupabaseClient, User } from "@supabase/supabase-js"

const getSafeEmail = (user: User) => {
  if (typeof user.email === "string" && user.email.trim().length > 0) {
    return user.email.trim()
  }
  return `unknown-${user.id}@example.invalid`
}

const getOptionalString = (value: unknown) => {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export const ensureUserProfile = async (
  supabaseClient: SupabaseClient<Database>,
  user: User,
) => {
  const fullName = getOptionalString(user.user_metadata?.full_name ?? user.user_metadata?.name)
  const avatarUrl = getOptionalString(user.user_metadata?.avatar_url)

  const payload: Database["public"]["Tables"]["users"]["Insert"] = {
    id: user.id,
    email: getSafeEmail(user),
    full_name: fullName,
    avatar_url: avatarUrl,
    is_active: true,
  }

  const { error } = await supabaseClient
    .from("users")
    .upsert(payload, { onConflict: "id", ignoreDuplicates: true })

  if (error) {
    throw new Error(`Failed to ensure user profile: ${error.message}`)
  }
}

