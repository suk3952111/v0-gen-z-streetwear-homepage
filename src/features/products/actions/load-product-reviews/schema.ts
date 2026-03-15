import { z } from "zod"

export const LoadProductReviewsSchema = z.object({
  productId: z.string().min(1),
  sortBy: z.enum(["newest", "highest", "lowest", "helpful"]).optional().default("newest"),
})

export type LoadProductReviewsInput = z.infer<typeof LoadProductReviewsSchema>

