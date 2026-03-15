import type { ProductReview } from "@/features/products/types/review"

export type LoadProductReviewsActionState = {
  success: boolean
  data: ProductReview[]
}

