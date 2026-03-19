"use server"

import { z } from "zod"
import { createSupabaseServer } from "@/lib/supabase/server"
import { getUserRoleById } from "@/features/users/services/get-user-role-by-id"

const ADMIN_ROLES = new Set(["platform_admin"])

const CreateProductSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(120).optional().default(""),
  description: z.string().max(2000).optional().default(""),
  basePrice: z.number().min(0),
  categoryId: z.string().uuid(),
  brandId: z.string().uuid().optional().nullable(),
  isPublished: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
  initialSize: z.string().min(1).max(20).optional().default("M"),
  initialStock: z.number().int().min(0).max(99999).optional().default(0),
})

const DeleteProductSchema = z.object({
  productId: z.string().uuid(),
})

const UpdateVariantStockSchema = z.object({
  variantId: z.string().uuid(),
  delta: z.number().int().min(-99999).max(99999).refine((value) => value !== 0),
})

type ActionState = {
  success: boolean
  errorMessage?: string
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

const toSku = (slug: string, size: string) =>
  `${slug}-${size}`.replace(/[^A-Za-z0-9-]/g, "").toUpperCase()

async function getAdminContext() {
  const supabase = await createSupabaseServer()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error("Login required")
  }

  const role = await getUserRoleById(supabase, user.id)
  if (!role || !ADMIN_ROLES.has(role)) {
    throw new Error("Admin access required")
  }

  return { supabase, userId: user.id }
}

async function writeAdminLog(input: {
  supabase: Awaited<ReturnType<typeof createSupabaseServer>>
  userId: string
  actionType: "create" | "update" | "delete"
  targetTable: string
  targetId?: string | null
  description?: string
  metadata?: Record<string, unknown>
}) {
  await input.supabase.from("admin_activity_logs").insert({
    admin_id: input.userId,
    action_type: input.actionType,
    target_table: input.targetTable,
    target_id: input.targetId ?? null,
    description: input.description ?? null,
    metadata: (input.metadata ?? null) as never,
  })
}

export async function createAdminProductAction(
  rawInput: z.input<typeof CreateProductSchema>,
): Promise<ActionState> {
  const parsed = CreateProductSchema.safeParse(rawInput)
  if (!parsed.success) {
    return { success: false, errorMessage: "Invalid product input" }
  }

  try {
    const { supabase, userId } = await getAdminContext()
    const input = parsed.data
    const slugBase = slugify(input.slug || input.name)
    if (!slugBase) {
      return { success: false, errorMessage: "Invalid slug" }
    }

    let finalSlug = slugBase
    let attempt = 0
    while (attempt < 5) {
      const { data: exists, error } = await supabase
        .from("products")
        .select("id")
        .eq("slug", finalSlug)
        .maybeSingle()
      if (error) throw new Error(error.message)
      if (!exists) break
      attempt += 1
      finalSlug = `${slugBase}-${Date.now().toString().slice(-4)}${attempt}`
    }

    const { data: insertedProduct, error: productError } = await supabase
      .from("products")
      .insert({
        name: input.name.trim(),
        slug: finalSlug,
        description: input.description.trim() || null,
        base_price: input.basePrice,
        category_id: input.categoryId,
        brand_id: input.brandId ?? null,
        seller_id: userId,
        is_published: input.isPublished,
        published_at: input.isPublished ? new Date().toISOString() : null,
        is_featured: input.isFeatured,
        is_deleted: false,
      })
      .select("id, slug")
      .single()

    if (productError || !insertedProduct) {
      throw new Error(productError?.message ?? "Failed to create product")
    }

    const cleanSize = input.initialSize.trim().toUpperCase()
    const skuBase = toSku(insertedProduct.slug, cleanSize)
    let finalSku = skuBase
    let skuAttempt = 0
    while (skuAttempt < 5) {
      const { data: skuExists, error } = await supabase
        .from("product_variants")
        .select("id")
        .eq("sku", finalSku)
        .maybeSingle()
      if (error) throw new Error(error.message)
      if (!skuExists) break
      skuAttempt += 1
      finalSku = `${skuBase}-${skuAttempt}`
    }

    const { error: variantError } = await supabase.from("product_variants").insert({
      product_id: insertedProduct.id,
      size: cleanSize,
      sku: finalSku,
      stock_quantity: input.initialStock,
      is_active: true,
      color: null,
      price_adjustment: 0,
    })
    if (variantError) throw new Error(variantError.message)

    await writeAdminLog({
      supabase,
      userId,
      actionType: "create",
      targetTable: "products",
      targetId: insertedProduct.id,
      description: `Created product ${input.name}`,
      metadata: { slug: insertedProduct.slug, initialSize: cleanSize, initialStock: input.initialStock },
    })

    return { success: true }
  } catch (error) {
    return {
      success: false,
      errorMessage: error instanceof Error ? error.message : "Failed to create product",
    }
  }
}

export async function deleteAdminProductAction(
  rawInput: z.input<typeof DeleteProductSchema>,
): Promise<ActionState> {
  const parsed = DeleteProductSchema.safeParse(rawInput)
  if (!parsed.success) {
    return { success: false, errorMessage: "Invalid product id" }
  }

  try {
    const { supabase, userId } = await getAdminContext()
    const { productId } = parsed.data

    const { error: updateError } = await supabase
      .from("products")
      .update({
        is_deleted: true,
        is_published: false,
      })
      .eq("id", productId)

    if (updateError) throw new Error(updateError.message)

    const { error: variantError } = await supabase
      .from("product_variants")
      .update({ is_active: false })
      .eq("product_id", productId)
    if (variantError) throw new Error(variantError.message)

    await writeAdminLog({
      supabase,
      userId,
      actionType: "delete",
      targetTable: "products",
      targetId: productId,
      description: "Soft deleted product and deactivated variants",
    })

    return { success: true }
  } catch (error) {
    return {
      success: false,
      errorMessage: error instanceof Error ? error.message : "Failed to delete product",
    }
  }
}

export async function updateAdminVariantStockAction(
  rawInput: z.input<typeof UpdateVariantStockSchema>,
): Promise<ActionState> {
  const parsed = UpdateVariantStockSchema.safeParse(rawInput)
  if (!parsed.success) {
    return { success: false, errorMessage: "Invalid stock update input" }
  }

  try {
    const { supabase, userId } = await getAdminContext()
    const { variantId, delta } = parsed.data

    const { data: variant, error: variantReadError } = await supabase
      .from("product_variants")
      .select("id, product_id, stock_quantity")
      .eq("id", variantId)
      .single()
    if (variantReadError || !variant) {
      throw new Error(variantReadError?.message ?? "Variant not found")
    }

    const prev = Number(variant.stock_quantity ?? 0)
    const next = Math.max(0, prev + delta)
    const { error: updateError } = await supabase
      .from("product_variants")
      .update({ stock_quantity: next })
      .eq("id", variantId)
    if (updateError) throw new Error(updateError.message)

    await writeAdminLog({
      supabase,
      userId,
      actionType: "update",
      targetTable: "product_variants",
      targetId: variantId,
      description: `Updated stock ${prev} -> ${next}`,
      metadata: { productId: variant.product_id, delta },
    })

    return { success: true }
  } catch (error) {
    return {
      success: false,
      errorMessage: error instanceof Error ? error.message : "Failed to update stock",
    }
  }
}
