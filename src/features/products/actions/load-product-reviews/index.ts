"use server"

import { createSupabaseServer } from "@/lib/supabase/server"
import { getProductReviews } from "@/features/products/services"
import { LoadProductReviewsSchema, type LoadProductReviewsInput } from "./schema"
import type { LoadProductReviewsActionState } from "./types"

export async function loadProductReviewsAction(
  input: LoadProductReviewsInput,
): Promise<LoadProductReviewsActionState> {
  const parsed = LoadProductReviewsSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      data: [],
    }
  }

  try {
    const supabase = await createSupabaseServer()
    const reviews = await getProductReviews(supabase, parsed.data.productId, parsed.data.sortBy)
    return {
      success: true,
      data: reviews,
    }
  } catch {
    return {
      success: false,
      data: [],
    }
  }
}

