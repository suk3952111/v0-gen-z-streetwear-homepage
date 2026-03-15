import type { ProductReview } from "@/features/products/types/review"

export type CreateProductReviewActionState = {
  success: boolean
  data: ProductReview | null
  errorMessage?: string
}

