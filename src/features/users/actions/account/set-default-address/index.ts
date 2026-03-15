"use server"

import { createSupabaseServer } from "@/lib/supabase/server"
import {
  SetDefaultAccountAddressSchema,
  type SetDefaultAccountAddressInput,
} from "./schema"
import type { SetDefaultAccountAddressActionState } from "./types"

const loadAddresses = async (supabase: any, userId: string) => {
  const { data, error } = await (supabase.from("user_addresses") as any)
    .select("id, recipient_name, phone, base_address, detail_address, city, postal_code, is_default")
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)

  return ((data ?? []) as Array<any>).map((row) => ({
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

    const { error: clearError } = await (supabase.from("user_addresses") as any)
      .update({ is_default: false })
      .eq("user_id", user.id)
    if (clearError) throw new Error(clearError.message)

    const { error: setError } = await (supabase.from("user_addresses") as any)
      .update({ is_default: true })
      .eq("id", parsed.data.id)
      .eq("user_id", user.id)
    if (setError) throw new Error(setError.message)

    const addresses = await loadAddresses(supabase, user.id)
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

