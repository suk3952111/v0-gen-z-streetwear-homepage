"use server"

import { createSupabaseServer } from "@/lib/supabase/server"
import { createProductReview } from "@/features/products/services"
import { CreateProductReviewSchema, type CreateProductReviewInput } from "./schema"
import type { CreateProductReviewActionState } from "./types"

export async function createProductReviewAction(
  input: CreateProductReviewInput,
): Promise<CreateProductReviewActionState> {
  const parsed = CreateProductReviewSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      data: null,
      errorMessage: "Invalid review input",
    }
  }

  try {
    const supabase = await createSupabaseServer()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return {
        success: false,
        data: null,
        errorMessage: "Login required",
      }
    }

    const result = await createProductReview(supabase, {
      productSlug: parsed.data.productId,
      userId: user.id,
      rating: parsed.data.rating,
      title: parsed.data.title,
      content: parsed.data.content,
      imageUrls: parsed.data.imageDataUrls,
    })

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save review"
    return {
      success: false,
      data: null,
      errorMessage: message,
    }
  }
}

