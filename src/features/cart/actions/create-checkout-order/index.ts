"use server"

import { createSupabaseServer } from "@/lib/supabase/server"
import { CreateCheckoutOrderSchema, type CreateCheckoutOrderInput } from "./schema"
import type { CreateCheckoutOrderActionState } from "./types"

const makeOrderNumber = () => {
  const date = new Date()
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `VC-${y}${m}${d}-${rand}`
}

const makeOrderName = (itemNames: string[]) => {
  if (itemNames.length === 0) {
    return "VIBE CHECK ORDER"
  }

  const [firstName, ...rest] = itemNames
  if (rest.length === 0) {
    return firstName
  }

  return `${firstName} and ${rest.length} more`
}

export async function createCheckoutOrderAction(
  input: CreateCheckoutOrderInput,
): Promise<CreateCheckoutOrderActionState> {
  const parsed = CreateCheckoutOrderSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      data: null,
      errorMessage: "Invalid checkout input",
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

    const { data: profileData, error: profileError } = await supabase
      .from("users")
      .select("email, full_name")
      .eq("id", user.id)
      .maybeSingle()

    if (profileError) throw new Error(profileError.message)

    const { data: cartRowsData, error: cartRowsError } = await supabase
      .from("cart_items")
      .select("id, product_id, variant_id, quantity")
      .eq("user_id", user.id)

    if (cartRowsError) throw new Error(cartRowsError.message)

    const cartRows = (cartRowsData ?? []) as Array<{
      id: string
      product_id: string
      variant_id: string | null
      quantity: number
    }>

    if (cartRows.length === 0) {
      return {
        success: false,
        data: null,
        errorMessage: "Cart is empty",
      }
    }

    const productIds = [...new Set(cartRows.map((row) => row.product_id))]
    const { data: productRowsData, error: productRowsError } = await supabase
      .from("products")
      .select("id, name, base_price, is_published, is_deleted")
      .in("id", productIds)

    if (productRowsError) throw new Error(productRowsError.message)

    const productRows = (productRowsData ?? []) as Array<{
      id: string
      name: string
      base_price: number
      is_published: boolean
      is_deleted: boolean
    }>
    const productById = new Map(productRows.map((row) => [row.id, row]))

    const invalid = cartRows.find((row) => {
      const product = productById.get(row.product_id)
      return !product || !product.is_published || product.is_deleted
    })

    if (invalid) {
      return {
        success: false,
        data: null,
        errorMessage: "Cart contains unavailable products",
      }
    }

    const { data: defaultAddressData } = await supabase
      .from("user_addresses")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_default", true)
      .maybeSingle()

    const defaultAddress = defaultAddressData as { id?: string } | null
    if (!defaultAddress?.id) {
      return {
        success: false,
        data: null,
        errorMessage: "Address required",
      }
    }

    const shippingFee = 0
    const itemPayload = cartRows.map((row) => {
      const product = productById.get(row.product_id)!
      return {
        product_id: row.product_id,
        product_name: product.name,
        variant_id: row.variant_id,
        quantity: Math.max(1, Number(row.quantity ?? 1)),
        unit_price: Number(product.base_price ?? 0),
      }
    })

    const totalAmount =
      itemPayload.reduce((acc, row) => acc + row.quantity * row.unit_price, 0) + shippingFee

    let createdOrder:
      | {
          id: string
          order_number: string
        }
      | null = null

    for (let i = 0; i < 6; i += 1) {
      const candidate = makeOrderNumber()
      const { data, error } = await supabase
        .from("orders")
        .insert({
          order_number: candidate,
          user_id: user.id,
          status: "pending",
          payment_method: "toss_payments",
          payment_status: "pending",
          shipping_fee: shippingFee,
          user_address_id: defaultAddress.id,
        })
        .select("id, order_number")
        .maybeSingle()

      if (!error && data?.id) {
        createdOrder = { id: data.id, order_number: data.order_number }
        break
      }

      if (!error?.message?.toLowerCase().includes("duplicate")) {
        throw new Error(error?.message ?? "Failed to create order")
      }
    }

    if (!createdOrder) {
      throw new Error("Failed to generate unique order number")
    }

    const orderItems = itemPayload.map((row) => ({
      order_id: createdOrder.id,
      product_id: row.product_id,
      variant_id: row.variant_id,
      quantity: row.quantity,
      unit_price: row.unit_price,
    }))

    const { error: itemInsertError } = await supabase.from("order_items").insert(orderItems)
    if (itemInsertError) throw new Error(itemInsertError.message)

    return {
      success: true,
      data: {
        orderId: createdOrder.id,
        orderNumber: createdOrder.order_number,
        orderName: makeOrderName(itemPayload.map((item) => item.product_name)),
        totalAmount,
        customerKey: user.id,
        customerEmail: profileData?.email ?? user.email ?? null,
        customerName: profileData?.full_name ?? null,
      },
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed"
    return {
      success: false,
      data: null,
      errorMessage: message,
    }
  }
}
