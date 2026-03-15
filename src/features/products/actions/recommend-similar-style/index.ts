"use server"

import { createSupabaseServer } from "@/lib/supabase/server"
import { recommendSimilarProductsByAi } from "@/features/products/services"
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
    const result = await recommendSimilarProductsByAi(supabase, parsed.data)
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

