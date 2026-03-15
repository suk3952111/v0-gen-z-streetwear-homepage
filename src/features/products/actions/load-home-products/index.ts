"use server"

import { createSupabaseServer } from "@/lib/supabase/server"
import { loadHomeProducts } from "@/features/products/services"
import type { LoadHomeProductsActionState } from "./types"

export async function loadHomeProductsAction(): Promise<LoadHomeProductsActionState> {
  try {
    const supabase = await createSupabaseServer()
    const products = await loadHomeProducts(supabase)
    return { success: true, data: products }
  } catch {
    return { success: false, data: [] }
  }
}
