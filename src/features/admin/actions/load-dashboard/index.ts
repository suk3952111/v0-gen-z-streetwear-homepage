"use server"

import { createSupabaseServer } from "@/lib/supabase/server"
import { getUserRoleById } from "@/features/users/services/get-user-role-by-id"
import { LoadAdminDashboardSchema, type LoadAdminDashboardInput } from "./schema"
import type { AdminDashboardPayload, LoadAdminDashboardActionState } from "./types"

const ADMIN_ROLES = new Set(["platform_admin"])
const SALES_STATUSES = ["confirmed", "shipped", "delivered"] as const

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
      { data: productRowsData, error: productRowsError },
      { data: lowStockRowsData, error: lowStockRowsError },
      { data: activityRowsData, error: activityRowsError },
      { data: categoryRowsData, error: categoryRowsError },
      { data: brandRowsData, error: brandRowsError },
    ] = await Promise.all([
      supabase.from("orders").select("id", { head: true, count: "exact" }),
      supabase.from("orders").select("id", { head: true, count: "exact" }).eq("status", "pending"),
      supabase
        .from("product_variants")
        .select("id", { head: true, count: "exact" })
        .eq("is_active", true)
        .lte("stock_quantity", 5),
      supabase
        .from("orders")
        .select("id, order_number, status, shipping_fee, created_at, user:users(full_name)")
        .order("created_at", { ascending: false })
        .range(from, to),
      supabase.from("orders").select("id, shipping_fee").in("status", SALES_STATUSES),
      supabase
        .from("products")
        .select(
          "id, name, slug, base_price, is_published, is_featured, updated_at, brand:brands(name), category:categories(name)",
        )
        .eq("is_deleted", false)
        .order("updated_at", { ascending: false })
        .limit(50),
      supabase
        .from("product_variants")
        .select("id, size, stock_quantity, is_active, updated_at, product:products(name, slug)")
        .eq("is_active", true)
        .lte("stock_quantity", 10)
        .order("stock_quantity", { ascending: true })
        .order("updated_at", { ascending: false })
        .limit(50),
      supabase
        .from("admin_activity_logs")
        .select("id, action_type, target_table, description, created_at, admin:users(full_name, email)")
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("categories")
        .select("id, name")
        .eq("is_active", true)
        .order("display_order", { ascending: true })
        .order("name", { ascending: true }),
      supabase.from("brands").select("id, name").eq("is_active", true).order("name", { ascending: true }),
    ])

    if (totalOrdersError) throw new Error(totalOrdersError.message)
    if (pendingOrdersError) throw new Error(pendingOrdersError.message)
    if (lowStockError) throw new Error(lowStockError.message)
    if (pagedOrdersError) throw new Error(pagedOrdersError.message)
    if (salesOrdersError) throw new Error(salesOrdersError.message)
    if (productRowsError) throw new Error(productRowsError.message)
    if (lowStockRowsError) throw new Error(lowStockRowsError.message)
    if (activityRowsError) throw new Error(activityRowsError.message)
    if (categoryRowsError) throw new Error(categoryRowsError.message)
    if (brandRowsError) throw new Error(brandRowsError.message)

    const pagedOrders = (pagedOrdersData ?? []) as Array<{
      id: string
      order_number: string
      status: string
      shipping_fee: number | null
      created_at: string
      user?: { full_name?: string | null } | null
    }>

    const pagedOrderIds = pagedOrders.map((order) => order.id)
    let pagedItemsData: Array<{ order_id: string; quantity: number; unit_price: number }> = []
    if (pagedOrderIds.length > 0) {
      const { data, error } = await supabase
        .from("order_items")
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
      createdAt: row.created_at,
    }))

    const products = ((productRowsData ?? []) as Array<{
      id: string
      name: string
      slug: string
      base_price: number
      is_published: boolean
      is_featured: boolean
      updated_at: string
      brand?: { name?: string | null } | null
      category?: { name?: string | null } | null
    }>).map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      brand: row.brand?.name ?? "-",
      category: row.category?.name ?? "-",
      basePrice: Number(row.base_price ?? 0),
      isPublished: Boolean(row.is_published),
      isFeatured: Boolean(row.is_featured),
      updatedAt: row.updated_at,
    }))

    const lowStockItems = ((lowStockRowsData ?? []) as Array<{
      id: string
      size: string
      stock_quantity: number
      is_active: boolean
      updated_at: string
      product?: { name?: string | null; slug?: string | null } | null
    }>).map((row) => ({
      id: row.id,
      productName: row.product?.name ?? "PRODUCT",
      productSlug: row.product?.slug ?? "-",
      size: row.size,
      stockQuantity: Number(row.stock_quantity ?? 0),
      isActive: Boolean(row.is_active),
      updatedAt: row.updated_at,
    }))

    const activities = ((activityRowsData ?? []) as Array<{
      id: string
      action_type: string
      target_table: string
      description: string | null
      created_at: string
      admin?: { full_name?: string | null; email?: string | null } | null
    }>).map((row) => ({
      id: row.id,
      actionType: row.action_type,
      targetTable: row.target_table,
      description: row.description,
      actor: row.admin?.full_name?.trim() || row.admin?.email?.trim() || "ADMIN",
      createdAt: row.created_at,
    }))

    const categories = ((categoryRowsData ?? []) as Array<{ id: string; name: string }>).map((row) => ({
      id: row.id,
      name: row.name,
    }))
    const brands = ((brandRowsData ?? []) as Array<{ id: string; name: string }>).map((row) => ({
      id: row.id,
      name: row.name,
    }))

    const salesOrders = (salesOrdersData ?? []) as Array<{ id: string; shipping_fee: number | null }>
    let sales = salesOrders.reduce((acc, row) => acc + Number(row.shipping_fee ?? 0), 0)
    const salesOrderIds = salesOrders.map((row) => row.id)
    if (salesOrderIds.length > 0) {
      const { data: salesItemsData, error: salesItemsError } = await supabase
        .from("order_items")
        .select("order_id, quantity, unit_price")
        .in("order_id", salesOrderIds)
      if (salesItemsError) throw new Error(salesItemsError.message)
      const rows = (salesItemsData ?? []) as Array<{ order_id: string; quantity: number; unit_price: number }>
      sales += rows.reduce((acc, row) => acc + Number(row.quantity ?? 0) * Number(row.unit_price ?? 0), 0)
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
      products,
      lowStockItems,
      activities,
      categories,
      brands,
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
