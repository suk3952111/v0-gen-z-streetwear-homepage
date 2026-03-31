"use server"

import { createSupabaseServer } from "@/lib/supabase/server"
import { loadAccountAddresses } from "../address-utils"
import { SaveAccountAddressSchema, type SaveAccountAddressInput } from "./schema"
import type { SaveAccountAddressActionState } from "./types"

export async function saveAccountAddressAction(
  input: SaveAccountAddressInput,
): Promise<SaveAccountAddressActionState> {
  const parsed = SaveAccountAddressSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      data: [],
      errorMessage: "Invalid address input",
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

    const payload = {
      user_id: user.id,
      recipient_name: parsed.data.recipient_name.trim(),
      phone: parsed.data.phone.trim(),
      base_address: parsed.data.address_line1.trim(),
      detail_address: parsed.data.address_line2.trim() || null,
      city: parsed.data.city.trim(),
      postal_code: parsed.data.postal_code.trim(),
    }

    if (parsed.data.id) {
      const { error } = await supabase
        .from("user_addresses")
        .update(payload)
        .eq("id", parsed.data.id)
        .eq("user_id", user.id)

      if (error) throw new Error(error.message)
    } else {
      const existingAddresses = await loadAccountAddresses(supabase, user.id)
      const { error } = await supabase.from("user_addresses").insert({
        ...payload,
        is_default: existingAddresses.length === 0,
      })
      if (error) throw new Error(error.message)
    }

    const addresses = await loadAccountAddresses(supabase, user.id)
    return {
      success: true,
      data: addresses,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save address"
    return {
      success: false,
      data: [],
      errorMessage: message,
    }
  }
}
