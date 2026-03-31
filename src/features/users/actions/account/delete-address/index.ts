"use server"

import { createSupabaseServer } from "@/lib/supabase/server"
import { loadAccountAddresses } from "../address-utils"
import { DeleteAccountAddressSchema, type DeleteAccountAddressInput } from "./schema"
import type { DeleteAccountAddressActionState } from "./types"

export async function deleteAccountAddressAction(
  input: DeleteAccountAddressInput,
): Promise<DeleteAccountAddressActionState> {
  const parsed = DeleteAccountAddressSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      data: [],
      errorMessage: "Invalid address id",
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
        data: [],
        errorMessage: "Login required",
      }
    }

    const { data: targetRow, error: targetError } = await supabase
      .from("user_addresses")
      .select("id, is_default")
      .eq("id", parsed.data.id)
      .eq("user_id", user.id)
      .maybeSingle()

    if (targetError) throw new Error(targetError.message)

    const { error: deleteError } = await supabase
      .from("user_addresses")
      .delete()
      .eq("id", parsed.data.id)
      .eq("user_id", user.id)
    if (deleteError) throw new Error(deleteError.message)

    if (targetRow?.is_default) {
      const { data: firstAddress, error: firstError } = await supabase
        .from("user_addresses")
        .select("id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (firstError) throw new Error(firstError.message)
      if (firstAddress?.id) {
        const { error: setError } = await supabase
          .from("user_addresses")
          .update({ is_default: true })
          .eq("id", firstAddress.id)
          .eq("user_id", user.id)
        if (setError) throw new Error(setError.message)
      }
    }

    const addresses = await loadAccountAddresses(supabase, user.id)
    return {
      success: true,
      data: addresses,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete address"
    return {
      success: false,
      data: [],
      errorMessage: message,
    }
  }
}
