import { z } from "zod"

export const CreateProductReviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  content: z.string().min(1).max(3000),
  imageDataUrls: z.array(z.string().min(1)).max(5).optional().default([]),
})

export type CreateProductReviewInput = z.infer<typeof CreateProductReviewSchema>

