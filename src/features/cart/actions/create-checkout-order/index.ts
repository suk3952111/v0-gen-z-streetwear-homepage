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

    const { data: cartRowsData, error: cartRowsError } = await (supabase.from("cart_items") as any)
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
    const { data: productRowsData, error: productRowsError } = await (supabase.from("products") as any)
      .select("id, base_price, is_published, is_deleted")
      .in("id", productIds)

    if (productRowsError) throw new Error(productRowsError.message)

    const productRows = (productRowsData ?? []) as Array<{
      id: string
      base_price: number
      is_published: boolean
      is_deleted: boolean
    }>
    const productById = new Map(productRows.map((row) => [row.id, row]))

    const invalid = cartRows.find((row) => {
      const p = productById.get(row.product_id)
      return !p || !p.is_published || p.is_deleted
    })
    if (invalid) {
      return {
        success: false,
        data: null,
        errorMessage: "Cart contains unavailable products",
      }
    }

    const { data: defaultAddressData } = await (supabase.from("user_addresses") as any)
      .select("id")
      .eq("user_id", user.id)
      .eq("is_default", true)
      .maybeSingle()

    const defaultAddress = defaultAddressData as { id?: string } | null

    const shippingFee = 0
    const itemPayload = cartRows.map((row) => {
      const product = productById.get(row.product_id)!
      const unitPrice = Number(product.base_price ?? 0)
      return {
        product_id: row.product_id,
        variant_id: row.variant_id,
        quantity: Math.max(1, Number(row.quantity ?? 1)),
        unit_price: unitPrice,
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
      const { data, error } = await (supabase.from("orders") as any)
        .insert({
          order_number: candidate,
          user_id: user.id,
          status: "pending",
          payment_method: "card",
          payment_status: "pending",
          shipping_fee: shippingFee,
          user_address_id: defaultAddress?.id ?? null,
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
      order_id: createdOrder!.id,
      product_id: row.product_id,
      variant_id: row.variant_id,
      quantity: row.quantity,
      unit_price: row.unit_price,
    }))

    const { error: itemInsertError } = await (supabase.from("order_items") as any).insert(orderItems)
    if (itemInsertError) throw new Error(itemInsertError.message)

    // Payment/order status transition after order creation.
    const { error: statusUpdateError } = await (supabase.from("orders") as any)
      .update({
        payment_status: "completed",
        status: "confirmed",
        paid_at: new Date().toISOString(),
      })
      .eq("id", createdOrder.id)
      .eq("user_id", user.id)

    if (statusUpdateError) throw new Error(statusUpdateError.message)

    const { error: cartDeleteError } = await (supabase.from("cart_items") as any)
      .delete()
      .eq("user_id", user.id)
    if (cartDeleteError) throw new Error(cartDeleteError.message)

    return {
      success: true,
      data: {
        orderId: createdOrder.id,
        orderNumber: createdOrder.order_number,
        orderStatus: "confirmed",
        paymentStatus: "completed",
        totalAmount,
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

