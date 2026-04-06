"use server"

import { getCartAiInsights, type CartAiInsights } from "@/features/cart/services/get-cart-ai-insights"
import { createSupabaseServer } from "@/lib/supabase/server"

type LoadCartAiInsightsInput = {
  items: Array<{
    productId: string
    quantity: number
  }>
  locale: "EN" | "KR"
}

type LoadCartAiInsightsActionState = {
  success: boolean
  data: CartAiInsights | null
}

export async function loadCartAiInsightsAction(
  input: LoadCartAiInsightsInput,
): Promise<LoadCartAiInsightsActionState> {
  const safeItems = Array.isArray(input.items)
    ? input.items.filter((item) => typeof item?.productId === "string" && typeof item?.quantity === "number")
    : []

  if (safeItems.length === 0) {
    return {
      success: true,
      data: {
        headline: input.locale === "KR" ? "장바구니가 비어 있어요." : "Your cart is empty.",
        supportingLine: input.locale === "KR"
          ? "상품을 담으면 AI가 스타일 흐름을 읽어드릴게요."
          : "Add items to let AI read the style direction of your cart.",
        signals: [],
        recommendations: [],
      },
    }
  }

  try {
    const supabase = await createSupabaseServer()
    const data = await getCartAiInsights(supabase, {
      items: safeItems,
      locale: input.locale === "KR" ? "KR" : "EN",
      limit: 3,
    })

    return {
      success: true,
      data,
    }
  } catch {
    return {
      success: false,
      data: null,
    }
  }
}
