"use server"

import { createSupabaseServer } from "@/lib/supabase/server"
import { loadAccountAddresses } from "../address-utils"
import {
  SetDefaultAccountAddressSchema,
  type SetDefaultAccountAddressInput,
} from "./schema"
import type { SetDefaultAccountAddressActionState } from "./types"

export async function setDefaultAccountAddressAction(
  input: SetDefaultAccountAddressInput,
): Promise<SetDefaultAccountAddressActionState> {
  const parsed = SetDefaultAccountAddressSchema.safeParse(input)
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

    const { error: clearError } = await supabase
      .from("user_addresses")
      .update({ is_default: false })
      .eq("user_id", user.id)
    if (clearError) throw new Error(clearError.message)

    const { error: setError } = await supabase
      .from("user_addresses")
      .update({ is_default: true })
      .eq("id", parsed.data.id)
      .eq("user_id", user.id)
    if (setError) throw new Error(setError.message)

    const addresses = await loadAccountAddresses(supabase, user.id)
    return {
      success: true,
      data: addresses,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to set default address"
    return {
      success: false,
      data: [],
      errorMessage: message,
    }
  }
}
