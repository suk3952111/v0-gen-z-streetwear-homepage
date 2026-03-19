"use server"

import { createSupabaseServer } from "@/lib/supabase/server"
import type { AccountAddress, AccountOrder, AccountOverview } from "@/features/users/types/account"
import type { Database } from "@/types/database.types"
import type { LoadAccountOverviewActionState } from "./types"

type UserAddressRow = Database["public"]["Tables"]["user_addresses"]["Row"]
type OrderRow = Database["public"]["Tables"]["orders"]["Row"]
type OrderItemRow = {
  order_id: string
  quantity: number
  unit_price: number
  product: { name: string } | null
}

const mapAddresses = (rows: UserAddressRow[]): AccountAddress[] => {
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

const mapOrders = (
  orderRows: OrderRow[],
  itemRows: OrderItemRow[],
): AccountOrder[] => {
  const itemsByOrderId = new Map<string, Array<{ name: string; quantity: number; amount: number }>>()

  itemRows.forEach((row) => {
    const list = itemsByOrderId.get(row.order_id) ?? []
    const quantity = Number(row.quantity ?? 0)
    const unitPrice = Number(row.unit_price ?? 0)
    list.push({
      name: row.product?.name ?? "ITEM",
      quantity,
      amount: quantity * unitPrice,
    })
    itemsByOrderId.set(row.order_id, list)
  })

  return orderRows.map((row) => {
    const orderItems = itemsByOrderId.get(row.id) ?? []
    const itemsTotal = orderItems.reduce((acc, item) => acc + item.amount, 0)
    const shippingFee = Number(row.shipping_fee ?? 0)

    return {
      id: row.id,
      order_number: row.order_number,
      status: row.status,
      final_amount: itemsTotal + shippingFee,
      created_at: row.created_at,
      items: orderItems.map((item) => ({
        name: item.name,
        quantity: item.quantity,
      })),
    }
  })
}

export async function loadAccountOverviewAction(): Promise<LoadAccountOverviewActionState> {
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

    const [{ data: profileRow, error: profileError }, { data: addressRows, error: addressError }, { data: orderRows, error: orderError }] =
      await Promise.all([
        supabase
          .from("users")
          .select("id, email, full_name, avatar_url, phone, created_at")
          .eq("id", user.id)
          .single(),
        supabase
          .from("user_addresses")
          .select("id, recipient_name, phone, base_address, detail_address, city, postal_code, is_default")
          .eq("user_id", user.id)
          .order("is_default", { ascending: false })
          .order("created_at", { ascending: false }),
        supabase
          .from("orders")
          .select("id, order_number, status, shipping_fee, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(30),
      ])

    if (profileError) throw new Error(profileError.message)
    if (addressError) throw new Error(addressError.message)
    if (orderError) throw new Error(orderError.message)

    if (!profileRow) {
      throw new Error("Profile not found")
    }

    const safeOrders = (orderRows ?? []) as OrderRow[]
    const orderIds = safeOrders.map((order) => order.id)

    let itemRows: OrderItemRow[] = []
    if (orderIds.length > 0) {
      const { data, error } = await supabase
        .from("order_items")
        .select("order_id, quantity, unit_price, product:products(name)")
        .in("order_id", orderIds)

      if (error) throw new Error(error.message)
      itemRows = (data ?? []) as unknown as OrderItemRow[]
    }

    const overview: AccountOverview = {
      profile: {
        id: profileRow.id,
        email: profileRow.email,
        full_name: profileRow.full_name,
        avatar_url: profileRow.avatar_url,
        phone: profileRow.phone,
        created_at: profileRow.created_at,
      },
      addresses: mapAddresses((addressRows ?? []) as UserAddressRow[]),
      orders: mapOrders(safeOrders, itemRows),
    }

    return {
      success: true,
      data: overview,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load account overview"
    return {
      success: false,
      data: null,
      errorMessage: message,
    }
  }
}
