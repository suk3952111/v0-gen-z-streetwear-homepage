"use server"

import type { SupabaseClient } from "@supabase/supabase-js"
import { createSupabaseServer } from "@/lib/supabase/server"
import type { Database } from "@/types/database.types"
import { SaveAccountAddressSchema, type SaveAccountAddressInput } from "./schema"
import type { SaveAccountAddressActionState } from "./types"

type UserAddressRow = Database["public"]["Tables"]["user_addresses"]["Row"]

const loadAddresses = async (supabase: SupabaseClient<Database>, userId: string) => {
  const { data, error } = await supabase
    .from("user_addresses")
    .select("id, recipient_name, phone, base_address, detail_address, city, postal_code, is_default")
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)

  return ((data ?? []) as UserAddressRow[]).map((row) => ({
    id: row.id,
    recipient_name: row.recipient_name,
    phone: row.phone,
    address_line1: row.base_address,
    address_line2: row.detail_address ?? "",
    city: row.city,
    postal_code: row.postal_code,
    is_default: Boolean(row.is_default),
  }))
}

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
      const existingAddresses = await loadAddresses(supabase, user.id)
      const { error } = await supabase.from("user_addresses").insert({
        ...payload,
        is_default: existingAddresses.length === 0,
      })
      if (error) throw new Error(error.message)
    }

    const addresses = await loadAddresses(supabase, user.id)
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
