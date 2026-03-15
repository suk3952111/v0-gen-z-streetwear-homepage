"use server"

import { createSupabaseServer } from "@/lib/supabase/server"
import { findStyleByImage } from "@/features/products/services"
import { FindStyleByImageSchema, type FindStyleByImageInput } from "./schema"
import type { FindStyleByImageActionState } from "./types"

export async function findStyleByImageAction(
  input: FindStyleByImageInput,
): Promise<FindStyleByImageActionState> {
  const parsed = FindStyleByImageSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      errorMessage: "입력 이미지 형식이 올바르지 않습니다.",
      data: { detectedTags: [], products: [] },
    }
  }

  try {
    const supabase = await createSupabaseServer()
    const result = await findStyleByImage(supabase, parsed.data)
    return {
      success: true,
      data: result,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI 스타일 검색에 실패했습니다."
    return {
      success: false,
      errorMessage: message,
      data: { detectedTags: [], products: [] },
    }
  }
}
