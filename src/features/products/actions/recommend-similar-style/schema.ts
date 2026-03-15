import { z } from "zod"

export const RecommendSimilarStyleSchema = z.object({
  productId: z.string().min(1),
  limit: z.number().int().min(1).max(12).optional().default(5),
})

export type RecommendSimilarStyleInput = z.infer<typeof RecommendSimilarStyleSchema>

