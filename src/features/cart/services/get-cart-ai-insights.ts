import type { Database } from "@/types/database.types"
import type { SupabaseClient } from "@supabase/supabase-js"
import { getProductsByIdsQueryBuilder } from "@/features/products/query-builder/get-products-by-ids.builder"
import { getProductTagRelationsByProductIdsQueryBuilder } from "@/features/products/query-builder/get-product-tag-relations-by-product-ids.builder"
import { getProductTagRelationsByTagIdsQueryBuilder } from "@/features/products/query-builder/get-product-tag-relations-by-tag-ids.builder"
import { getProductsBySlugs } from "@/features/products/services/get-products-by-slugs"
import type { ShopProductItem } from "@/features/products/types/shop"

type CartAiInputItem = {
  productId: string
  quantity: number
}

type CartAiLocale = "EN" | "KR"

export type CartAiSignal = {
  label: string
  score: number
  color: string
}

export type CartAiRecommendation = {
  product: ShopProductItem
  reason: string
  matchScore: number
}

export type CartAiInsights = {
  headline: string
  supportingLine: string
  signals: CartAiSignal[]
  recommendations: CartAiRecommendation[]
}

const SIGNAL_COLORS = ["#00E5FF", "#CCFF00", "#FF4FD8", "#FF8A00", "#7CFFCB"]

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

const normalizeTagLabel = (value: string) =>
  value.trim().replace(/^#+/, "").replace(/[-_]+/g, " ").replace(/\s+/g, " ").toUpperCase()

const toTitleCase = (value: string) =>
  value
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ")

const createFallbackCopy = (locale: CartAiLocale, signals: CartAiSignal[], productCount: number) => {
  const signalNames = signals.map((signal) => signal.label)
  const summary = signalNames.join(", ")

  if (locale === "KR") {
    return {
      headline: summary ? `${summary} 무드가 중심인 장바구니예요.` : "지금 장바구니의 스타일 흐름을 읽었어요.",
      supportingLine: `${productCount}개 상품 조합을 기준으로 어울리는 아이템을 추천해드려요.`,
    }
  }

  return {
    headline: summary ? `Your cart leans ${summary.toLowerCase()} overall.` : "We read the overall direction of your cart.",
    supportingLine: `Recommendations are based on the mix of ${productCount} item${productCount === 1 ? "" : "s"} in your cart.`,
  }
}

const generateAiCopy = async (
  locale: CartAiLocale,
  products: ShopProductItem[],
  signals: CartAiSignal[],
) => {
  const fallback = createFallbackCopy(locale, signals, products.length)
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey || products.length === 0) {
    return fallback
  }

  const languageInstruction = locale === "KR" ? "Write natural Korean." : "Write natural English."
  const productSummary = products
    .slice(0, 8)
    .map((product) => `${product.name} [${product.category.EN}] tags=${product.tags.join(", ") || "none"}`)
    .join("\n")
  const signalSummary = signals.map((signal) => `${signal.label}:${signal.score}`).join(", ")

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text:
                    `Return JSON only with {"headline":"...","supportingLine":"..."}. ` +
                    `${languageInstruction} Headline under 90 characters. supportingLine under 120 characters. ` +
                    `Write like a fashion ecommerce cart insight, concise and useful.\n\n` +
                    `Signals: ${signalSummary || "none"}\nProducts:\n${productSummary}`,
                },
              ],
            },
          ],
        }),
      },
    )

    if (!response.ok) return fallback

    const body = await response.json() as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>
        }
      }>
    }
    const raw = body.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim() ?? ""
    const normalized = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim()
    const start = normalized.indexOf("{")
    const end = normalized.lastIndexOf("}")
    const payload = start >= 0 && end > start ? normalized.slice(start, end + 1) : normalized
    const parsed = JSON.parse(payload) as { headline?: string; supportingLine?: string }

    return {
      headline: (parsed.headline ?? fallback.headline).trim() || fallback.headline,
      supportingLine: (parsed.supportingLine ?? fallback.supportingLine).trim() || fallback.supportingLine,
    }
  } catch {
    return fallback
  }
}

const buildRecommendationReason = (locale: CartAiLocale, matchedLabels: string[], fallbackLabel: string) => {
  const labels = matchedLabels.slice(0, 2).map((label) => toTitleCase(label)).join(", ")
  const focus = labels || toTitleCase(fallbackLabel)

  if (locale === "KR") {
    return `${focus} 무드가 현재 장바구니 조합과 자연스럽게 이어져요.`
  }

  return `${focus} works naturally with the direction already building in your cart.`
}

export const getCartAiInsights = async (
  supabaseClient: SupabaseClient<Database>,
  input: {
    items: CartAiInputItem[]
    locale: CartAiLocale
    limit?: number
  },
): Promise<CartAiInsights> => {
  const items = input.items
    .map((item) => ({
      productId: item.productId.trim(),
      quantity: clamp(Math.round(Number(item.quantity) || 1), 1, 99),
    }))
    .filter((item) => item.productId.length > 0)

  if (items.length === 0) {
    return {
      headline: input.locale === "KR" ? "장바구니가 비어 있어요." : "Your cart is empty.",
      supportingLine: input.locale === "KR"
        ? "상품을 담으면 AI가 스타일 흐름을 읽어드릴게요."
        : "Add items to let AI read the style direction of your cart.",
      signals: [],
      recommendations: [],
    }
  }

  const productIds = [...new Set(items.map((item) => item.productId))]
  const quantityByProductId = new Map(items.map((item) => [item.productId, item.quantity]))

  const { data: productRowsData, error: productRowsError } = await getProductsByIdsQueryBuilder(supabaseClient, productIds)
  if (productRowsError) {
    throw new Error(`Failed to load cart products: ${productRowsError.message}`)
  }

  const productRows = (productRowsData ?? []) as Array<{ id: string; slug: string }>
  const slugById = new Map(productRows.map((row) => [row.id, row.slug]))
  const orderedSlugs = productIds
    .map((productId) => slugById.get(productId))
    .filter((slug): slug is string => typeof slug === "string" && slug.length > 0)

  const products = await getProductsBySlugs(supabaseClient, orderedSlugs)
  const cartProducts = products.filter((product) => quantityByProductId.has(product.id))

  const signalWeightByLabel = new Map<string, number>()
  cartProducts.forEach((product) => {
    const quantity = quantityByProductId.get(product.id) ?? 1
    const tags = product.tags.length > 0 ? product.tags : [product.category.EN]
    ;[...new Set(tags.map(normalizeTagLabel).filter(Boolean))].forEach((tag) => {
      signalWeightByLabel.set(tag, (signalWeightByLabel.get(tag) ?? 0) + quantity)
    })
  })

  const totalSignalWeight = [...signalWeightByLabel.values()].reduce((sum, value) => sum + value, 0)
  const signals = [...signalWeightByLabel.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([label, weight], index) => ({
      label,
      score: totalSignalWeight > 0 ? Math.max(12, Math.round((weight / totalSignalWeight) * 100)) : 0,
      color: SIGNAL_COLORS[index % SIGNAL_COLORS.length],
    }))

  const copy = await generateAiCopy(input.locale, cartProducts, signals)

  const { data: sourceTagRowsData, error: sourceTagRowsError } = await getProductTagRelationsByProductIdsQueryBuilder(
    supabaseClient,
    productIds,
  )
  if (sourceTagRowsError) {
    throw new Error(`Failed to load cart tag relations: ${sourceTagRowsError.message}`)
  }

  const sourceTagRows = (sourceTagRowsData ?? []) as Array<{ product_id: string; tag_id: string }>
  const sourceTagWeightById = new Map<string, number>()
  sourceTagRows.forEach((row) => {
    const quantity = quantityByProductId.get(row.product_id) ?? 1
    sourceTagWeightById.set(row.tag_id, (sourceTagWeightById.get(row.tag_id) ?? 0) + quantity)
  })

  const sourceTagIds = [...sourceTagWeightById.keys()]
  if (sourceTagIds.length === 0) {
    return {
      headline: copy.headline,
      supportingLine: copy.supportingLine,
      signals,
      recommendations: [],
    }
  }

  const sourceTagNameById = new Map<string, string>()
  sourceTagRows.forEach((row) => {
    if (sourceTagNameById.has(row.tag_id)) return
    const product = cartProducts.find((entry) => entry.id === row.product_id)
    const label = product?.tags[0] ?? product?.category.EN
    if (label) {
      sourceTagNameById.set(row.tag_id, normalizeTagLabel(label))
    }
  })

  const { data: relationRowsData, error: relationRowsError } = await getProductTagRelationsByTagIdsQueryBuilder(
    supabaseClient,
    sourceTagIds,
  )
  if (relationRowsError) {
    throw new Error(`Failed to load related tag relations: ${relationRowsError.message}`)
  }

  const relationRows = (relationRowsData ?? []) as Array<{ product_id: string; tag_id: string }>
  const cartIdSet = new Set(productIds)
  const scoreByProductId = new Map<string, number>()
  const matchedLabelsByProductId = new Map<string, string[]>()

  relationRows.forEach((row) => {
    if (cartIdSet.has(row.product_id)) return
    scoreByProductId.set(row.product_id, (scoreByProductId.get(row.product_id) ?? 0) + (sourceTagWeightById.get(row.tag_id) ?? 0))

    const label = sourceTagNameById.get(row.tag_id)
    if (!label) return
    const labels = matchedLabelsByProductId.get(row.product_id) ?? []
    if (!labels.includes(label)) {
      labels.push(label)
      matchedLabelsByProductId.set(row.product_id, labels)
    }
  })

  const totalTagWeight = [...sourceTagWeightById.values()].reduce((sum, value) => sum + value, 0)
  const ranked = [...scoreByProductId.entries()]
    .map(([productId, score]) => ({
      productId,
      matchScore: totalTagWeight > 0 ? clamp(Math.round((score / totalTagWeight) * 100), 18, 99) : 0,
      score,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(3, input.limit ?? 3))

  if (ranked.length === 0) {
    return {
      headline: copy.headline,
      supportingLine: copy.supportingLine,
      signals,
      recommendations: [],
    }
  }

  const candidateIds = ranked.map((row) => row.productId)
  const { data: candidateRowsData, error: candidateRowsError } = await getProductsByIdsQueryBuilder(supabaseClient, candidateIds)
  if (candidateRowsError) {
    throw new Error(`Failed to load AI recommendation candidates: ${candidateRowsError.message}`)
  }

  const candidateRows = (candidateRowsData ?? []) as Array<{ id: string; slug: string }>
  const candidateSlugById = new Map(candidateRows.map((row) => [row.id, row.slug]))
  const recommendationSlugs = candidateIds
    .map((productId) => candidateSlugById.get(productId))
    .filter((slug): slug is string => typeof slug === "string" && slug.length > 0)

  const recommendationProducts = await getProductsBySlugs(supabaseClient, recommendationSlugs)
  const recommendationById = new Map(recommendationProducts.map((product) => [product.id, product]))

  const recommendations = ranked
    .map((row) => {
      const product = recommendationById.get(row.productId)
      if (!product) return null
      return {
        product: {
          ...product,
          aiMatch: row.matchScore,
        },
        reason: buildRecommendationReason(
          input.locale,
          matchedLabelsByProductId.get(row.productId) ?? [],
          signals[0]?.label ?? product.category.EN,
        ),
        matchScore: row.matchScore,
      }
    })
    .filter((entry): entry is CartAiRecommendation => entry !== null)
    .slice(0, input.limit ?? 3)

  return {
    headline: copy.headline,
    supportingLine: copy.supportingLine,
    signals,
    recommendations,
  }
}
