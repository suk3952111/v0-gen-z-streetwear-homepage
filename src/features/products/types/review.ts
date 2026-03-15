export type ProductReviewSortBy = "newest" | "highest" | "lowest" | "helpful"

export type ProductReview = {
  id: string
  user_id: string
  username: string
  avatar_url?: string
  rating: number
  title: string
  content: string
  images: string[]
  is_verified_purchase: boolean
  helpful_count: number
  created_at: string
}

