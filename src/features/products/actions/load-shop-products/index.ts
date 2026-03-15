"use server"

import { createSupabaseServer } from "@/lib/supabase/server"
import { loadShopProductsPage } from "@/features/products/services"
import { LoadShopProductsSchema, type LoadShopProductsInput } from "./schema"
import type { LoadShopProductsActionState } from "./types"

export async function loadShopProductsAction(
  input: LoadShopProductsInput,
): Promise<LoadShopProductsActionState> {
  const parsed = LoadShopProductsSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      data: { items: [], hasMore: false, nextOffset: 0 },
    }
  }

  try {
    const supabase = await createSupabaseServer()
    const page = await loadShopProductsPage(supabase, parsed.data)
    return { success: true, data: page }
  } catch {
    return {
      success: false,
      data: { items: [], hasMore: false, nextOffset: 0 },
    }
  }
}
