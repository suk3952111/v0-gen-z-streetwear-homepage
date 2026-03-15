"use server"

import { createSupabaseServer } from "@/lib/supabase/server"
import { getUserRoleById } from "@/features/users/services/get-user-role-by-id"
import { LoadAdminDashboardSchema, type LoadAdminDashboardInput } from "./schema"
import type { AdminDashboardPayload, LoadAdminDashboardActionState } from "./types"

const ADMIN_ROLES = new Set(["platform_admin"])
const SALES_STATUSES = ["confirmed", "shipped", "delivered"]

export async function loadAdminDashboardAction(
  input: LoadAdminDashboardInput,
): Promise<LoadAdminDashboardActionState> {
  const parsed = LoadAdminDashboardSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      data: null,
      errorMessage: "Invalid dashboard query",
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

    const role = await getUserRoleById(supabase, user.id)
    if (!role || !ADMIN_ROLES.has(role)) {
      return {
        success: false,
        data: null,
        errorMessage: "Admin access required",
      }
    }

    const page = parsed.data.page
    const pageSize = parsed.data.pageSize
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const [
      { count: totalOrders, error: totalOrdersError },
      { count: pendingOrders, error: pendingOrdersError },
      { count: lowStockCount, error: lowStockError },
      { data: pagedOrdersData, error: pagedOrdersError },
      { data: salesOrdersData, error: salesOrdersError },
    ] = await Promise.all([
      (supabase.from("orders") as any).select("id", { head: true, count: "exact" }),
      (supabase.from("orders") as any)
        .select("id", { head: true, count: "exact" })
        .eq("status", "pending"),
      (supabase.from("product_variants") as any)
        .select("id", { head: true, count: "exact" })
        .eq("is_active", true)
        .lte("stock_quantity", 5),
      (supabase.from("orders") as any)
        .select("id, order_number, status, shipping_fee, user:users(full_name)")
        .order("created_at", { ascending: false })
        .range(from, to),
      (supabase.from("orders") as any)
        .select("id, shipping_fee")
        .in("status", SALES_STATUSES),
    ])

    if (totalOrdersError) throw new Error(totalOrdersError.message)
    if (pendingOrdersError) throw new Error(pendingOrdersError.message)
    if (lowStockError) throw new Error(lowStockError.message)
    if (pagedOrdersError) throw new Error(pagedOrdersError.message)
    if (salesOrdersError) throw new Error(salesOrdersError.message)

    const pagedOrders = (pagedOrdersData ?? []) as Array<{
      id: string
      order_number: string
      status: string
      shipping_fee: number | null
      user?: { full_name?: string | null } | null
    }>

    const pagedOrderIds = pagedOrders.map((order) => order.id)
    let pagedItemsData: Array<{ order_id: string; quantity: number; unit_price: number }> = []
    if (pagedOrderIds.length > 0) {
      const { data, error } = await (supabase.from("order_items") as any)
        .select("order_id, quantity, unit_price")
        .in("order_id", pagedOrderIds)
      if (error) throw new Error(error.message)
      pagedItemsData = (data ?? []) as Array<{ order_id: string; quantity: number; unit_price: number }>
    }

    const itemTotalByOrderId = new Map<string, number>()
    pagedItemsData.forEach((row) => {
      const amount = Number(row.quantity ?? 0) * Number(row.unit_price ?? 0)
      const prev = itemTotalByOrderId.get(row.order_id) ?? 0
      itemTotalByOrderId.set(row.order_id, prev + amount)
    })

    const orders = pagedOrders.map((row) => ({
      id: row.id,
      orderNumber: row.order_number,
      customer: row.user?.full_name?.trim() || "CUSTOMER",
      status: row.status,
      total: (itemTotalByOrderId.get(row.id) ?? 0) + Number(row.shipping_fee ?? 0),
    }))

    const salesOrders = (salesOrdersData ?? []) as Array<{ id: string; shipping_fee: number | null }>
    let sales = salesOrders.reduce((acc, row) => acc + Number(row.shipping_fee ?? 0), 0)
    const salesOrderIds = salesOrders.map((row) => row.id)
    if (salesOrderIds.length > 0) {
      const { data: salesItemsData, error: salesItemsError } = await (supabase.from("order_items") as any)
        .select("order_id, quantity, unit_price")
        .in("order_id", salesOrderIds)
      if (salesItemsError) throw new Error(salesItemsError.message)
      const rows = (salesItemsData ?? []) as Array<{ order_id: string; quantity: number; unit_price: number }>
      sales += rows.reduce(
        (acc, row) => acc + Number(row.quantity ?? 0) * Number(row.unit_price ?? 0),
        0,
      )
    }

    const total = Number(totalOrders ?? 0)
    const payload: AdminDashboardPayload = {
      stats: {
        sales,
        orders: total,
        pending: Number(pendingOrders ?? 0),
        lowStock: Number(lowStockCount ?? 0),
      },
      orders,
      page,
      pageSize,
      totalOrders: total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    }

    return {
      success: true,
      data: payload,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load admin dashboard"
    return {
      success: false,
      data: null,
      errorMessage: message,
    }
  }
}

