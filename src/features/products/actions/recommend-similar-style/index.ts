"use server"

import { createSupabaseServer } from "@/lib/supabase/server"
import { recommendSimilarProductsByAi, recommendSimilarProductsByTags } from "@/features/products/services"
import type { ShopProductItem } from "@/features/products/types/shop"
import {
  RecommendSimilarStyleSchema,
  type RecommendSimilarStyleInput,
} from "./schema"
import type { RecommendSimilarStyleActionState } from "./types"

export async function recommendSimilarStyleAction(
  input: RecommendSimilarStyleInput,
): Promise<RecommendSimilarStyleActionState> {
  const parsed = RecommendSimilarStyleSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      data: [],
    }
  }

  try {
    const supabase = await createSupabaseServer()
    let result: ShopProductItem[] = []

    try {
      result = await recommendSimilarProductsByAi(supabase, parsed.data)
    } catch {
      result = []
    }

    if (result.length === 0) {
      result = await recommendSimilarProductsByTags(supabase, parsed.data)
    }

    return {
      success: true,
      data: result,
    }
  } catch {
    return {
      success: false,
      data: [],
    }
  }
}

