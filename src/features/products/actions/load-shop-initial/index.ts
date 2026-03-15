"use server"

import { createSupabaseServer } from "@/lib/supabase/server"
import { loadShopInitialData } from "@/features/products/services"
import type { LoadShopInitialActionState } from "./types"

export async function loadShopInitialAction(): Promise<LoadShopInitialActionState> {
  try {
    const supabase = await createSupabaseServer()
    const payload = await loadShopInitialData(supabase)
    return { success: true, data: payload }
  } catch {
    return {
      success: false,
      data: {
        categories: [{ value: "all", label: "ALL" }],
        tags: [],
        page: { items: [], hasMore: false, nextOffset: 0 },
      },
    }
  }
}
