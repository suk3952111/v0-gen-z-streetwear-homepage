"use server"

import { createSupabaseServer } from "@/lib/supabase/server"
import { UpdateAccountProfileSchema, type UpdateAccountProfileInput } from "./schema"
import type { UpdateAccountProfileActionState } from "./types"

export async function updateAccountProfileAction(
  input: UpdateAccountProfileInput,
): Promise<UpdateAccountProfileActionState> {
  const parsed = UpdateAccountProfileSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      data: null,
      errorMessage: "Invalid profile input",
    }
  }

  try {
    const supabase = await createSupabaseServer()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        data: null,
        errorMessage: "Login required",
      }
    }

    const { data, error } = await supabase
      .from("users")
      .update({
        full_name: parsed.data.full_name.trim(),
        phone: parsed.data.phone.trim() || null,
        avatar_url: parsed.data.avatar_url.trim() || null,
      })
      .eq("id", user.id)
      .select("id, email, full_name, avatar_url, phone, created_at")
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return {
      success: true,
      data: {
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        avatar_url: data.avatar_url,
        phone: data.phone,
        created_at: data.created_at,
      },
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update profile"
    return {
      success: false,
      data: null,
      errorMessage: message,
    }
  }
}
