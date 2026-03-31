import type { SupabaseClient } from "@supabase/supabase-js"
import type { AccountAddress } from "@/features/users/types/account"
import type { Database } from "@/types/database.types"

export type UserAddressRow = Database["public"]["Tables"]["user_addresses"]["Row"]

export const mapAccountAddresses = (rows: UserAddressRow[]): AccountAddress[] => {
  return rows.map((row) => ({
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

export const loadAccountAddresses = async (
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<AccountAddress[]> => {
  const { data, error } = await supabase
    .from("user_addresses")
    .select("id, recipient_name, phone, base_address, detail_address, city, postal_code, is_default")
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)

  return mapAccountAddresses((data ?? []) as UserAddressRow[])
}
