"use client"

import React from "react"
import { useState, useRef, useMemo } from "react"
import Image from "next/image"
import { Star, X, CheckCircle, ThumbsUp, Camera } from "lucide-react"
import { motion } from "framer-motion"
import type { Language } from "@/lib/products"
import type { FocusImage } from "./image-focus-modal"
import { mockReviews } from "@/mocks/reviews"

interface Review {
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

interface ReviewSectionProps {
  productId: string
  language: Language
  onImageClick?: (images: FocusImage[], startIndex: number) => void
}

const content = {
  EN: {
    title: "REVIEWS",
    customerPhotos: "CUSTOMER PHOTOS",
    writeReview: "WRITE A REVIEW",
    ratingLabel: "YOUR RATING",
    titleLabel: "REVIEW TITLE",
    titlePlaceholder: "Summarize your experience",
    contentLabel: "YOUR REVIEW",
    contentPlaceholder: "Share your thoughts about this product...",
    imagesLabel: "ADD PHOTOS",
    imagesHint: "Upload up to 5 images (optional)",
    submit: "SUBMIT REVIEW",
    cancel: "CANCEL",
    verifiedPurchase: "VERIFIED PURCHASE",
    helpful: "HELPFUL",
    noReviews: "NO REVIEWS YET",
    beFirst: "Be the first to review this product",
    sortBy: "SORT BY",
    newest: "Newest",
    highest: "Highest Rated",
    lowest: "Lowest Rated",
    mostHelpful: "Most Helpful",
    averageRating: "AVERAGE RATING",
    totalReviews: (count: number) => `${count} REVIEW${count !== 1 ? "S" : ""}`,
  },
  KR: {
    title: "리뷰",
    customerPhotos: "고객 사진",
    writeReview: "리뷰 작성하기",
    ratingLabel: "평점",
    titleLabel: "리뷰 제목",
    titlePlaceholder: "경험을 요약해 주세요",
    contentLabel: "리뷰 내용",
    contentPlaceholder: "이 상품에 대한 생각을 공유해 주세요...",
    imagesLabel: "사진 추가",
    imagesHint: "최대 5장까지 업로드 가능(선택사항)",
    submit: "리뷰 등록",
    cancel: "취소",
    verifiedPurchase: "구매 인증",
    helpful: "도움돼요",
    noReviews: "아직 리뷰가 없습니다",
    beFirst: "첫 번째 리뷰를 작성해 보세요",
    sortBy: "정렬",
    newest: "최신순",
    highest: "평점 높은순",
    lowest: "평점 낮은순",
    mostHelpful: "도움순",
    averageRating: "평균 평점",
    totalReviews: (count: number) => `${count}개의 리뷰`,
  },
}

export function ReviewSection({ productId, language, onImageClick }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(mockReviews)
  const [isWriting, setIsWriting] = useState(false)
  const [sortBy, setSortBy] = useState<"newest" | "highest" | "lowest" | "helpful">("newest")

  // Form state
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState("")
  const [reviewContent, setReviewContent] = useState("")
  const [uploadedImages, setUploadedImages] = useState<string[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const t = language === "KR" ? content.KR : content.EN

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0"

  // Collect all review images with context for the focus-mode gallery
  const allReviewFocusImages: FocusImage[] = useMemo(() => {
    const imgs: FocusImage[] = []
    reviews.forEach((review) => {
      review.images.forEach((src, imgIdx) => {
        imgs.push({
          id: `review-${review.id}-${imgIdx}`,
          src: src.replace("w=400&h=400", "w=800&h=800"),
          alt: `${review.username} - photo ${imgIdx + 1}`,
          type: "review",
          reviewContext: {
            username: review.username,
            rating: review.rating,
            content: review.content,
          },
        })
      })
    })
    return imgs
  }, [reviews])

  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case "newest": return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case "highest": return b.rating - a.rating
      case "lowest": return a.rating - b.rating
      case "helpful": return b.helpful_count - a.helpful_count
      default: return 0
    }
  })

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const newImages: string[] = []
    Array.from(files).slice(0, 5 - uploadedImages.length).forEach(file => {
      newImages.push(URL.createObjectURL(file))
    })
    setUploadedImages(prev => [...prev, ...newImages].slice(0, 5))
  }

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0 || !reviewContent.trim()) return
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      user_id: "current-user",
      username: "VIBE_USER",
      rating,
      title: title || "Great product",
      content: reviewContent,
      images: uploadedImages,
      is_verified_purchase: false,
      helpful_count: 0,
      created_at: new Date().toISOString(),
    }
    setReviews(prev => [newReview, ...prev])
    setIsWriting(false)
    setRating(0)
    setTitle("")
    setReviewContent("")
    setUploadedImages([])
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      language === "KR" ? "ko-KR" : "en-US",
      { year: "numeric", month: "short", day: "numeric" }
    )
  }

  // Handle clicking a review image -- find its global index
  const handleReviewImageClick = (reviewId: string, imgIdx: number) => {
    if (!onImageClick) return
    const globalIdx = allReviewFocusImages.findIndex(
      (fi) => fi.id === `review-${reviewId}-${imgIdx}`
    )
    onImageClick(allReviewFocusImages, globalIdx >= 0 ? globalIdx : 0)
  }

  return (
    <section className="px-4 md:px-8 py-16 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="border-b-4 border-[#CCFF00] pb-4 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-3xl md:text-5xl font-bold text-white uppercase tracking-tighter">
            {t.title}
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-[#888888] text-xs uppercase tracking-wider mb-1">{t.averageRating}</p>
              <div className="flex items-center gap-2">
                <span className="text-4xl font-bold text-[#CCFF00]">{averageRating}</span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-5 h-5 ${s <= Math.round(Number(averageRating)) ? "text-[#CCFF00] fill-[#CCFF00]" : "text-[#333333]"}`} />
                  ))}
                </div>
              </div>
              <p className="text-[#888888] text-sm mt-1">{t.totalReviews(reviews.length)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Photos Strip - clickable */}
      {allReviewFocusImages.length > 0 && (
        <div className="mb-10">
          <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">{t.customerPhotos}</h3>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {allReviewFocusImages.map((fi, idx) => (
              <motion.button
                key={fi.id}
                layoutId={`focus-image-${fi.id}`}
                onClick={() => onImageClick?.(allReviewFocusImages, idx)}
                className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 border-2 border-[#333333] hover:border-[#CCFF00] transition-colors overflow-hidden group cursor-zoom-in"
              >
                <Image
                  src={fi.src || "/placeholder.svg"}
                  alt={fi.alt}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-[#CCFF00] opacity-0 group-hover:opacity-10 transition-opacity" />
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Write Review Button / Form */}
      {!isWriting ? (
        <button
          onClick={() => setIsWriting(true)}
          className="mb-8 px-8 py-4 bg-[#CCFF00] text-[#0a0a0a] text-lg font-bold uppercase tracking-wider border-4 border-[#CCFF00] hover:bg-[#0a0a0a] hover:text-[#CCFF00] transition-colors"
        >
          {t.writeReview}
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="mb-12 border-4 border-[#CCFF00] p-6 bg-[#0a0a0a]">
          {/* Rating */}
          <div className="mb-6">
            <label className="block text-white text-sm font-bold uppercase tracking-wider mb-3">{t.ratingLabel} *</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star className={`w-10 h-10 transition-colors ${s <= (hoverRating || rating) ? "text-[#CCFF00] fill-[#CCFF00]" : "text-[#333333]"}`} />
                </button>
              ))}
            </div>
          </div>
          {/* Title */}
          <div className="mb-6">
            <label className="block text-white text-sm font-bold uppercase tracking-wider mb-3">{t.titleLabel}</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t.titlePlaceholder} className="w-full px-4 py-3 bg-[#1a1a1a] border-2 border-[#333333] text-white placeholder-[#666666] focus:border-[#CCFF00] focus:outline-none uppercase" />
          </div>
          {/* Content */}
          <div className="mb-6">
            <label className="block text-white text-sm font-bold uppercase tracking-wider mb-3">{t.contentLabel} *</label>
            <textarea value={reviewContent} onChange={(e) => setReviewContent(e.target.value)} placeholder={t.contentPlaceholder} rows={4} className="w-full px-4 py-3 bg-[#1a1a1a] border-2 border-[#333333] text-white placeholder-[#666666] focus:border-[#CCFF00] focus:outline-none resize-none" />
          </div>
          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-white text-sm font-bold uppercase tracking-wider mb-3">{t.imagesLabel}</label>
            <p className="text-[#888888] text-xs mb-3">{t.imagesHint}</p>
            <div className="flex flex-wrap gap-3">
              {uploadedImages.map((img, index) => (
                <div key={index} className="relative w-20 h-20 border-2 border-[#CCFF00]">
                  <Image src={img || "/placeholder.svg"} alt={`Upload ${index + 1}`} fill className="object-cover" />
                  <button type="button" onClick={() => removeImage(index)} className="absolute -top-2 -right-2 w-6 h-6 bg-[#ff4444] text-white flex items-center justify-center">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {uploadedImages.length < 5 && (
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-20 h-20 border-2 border-dashed border-[#333333] text-[#666666] flex flex-col items-center justify-center hover:border-[#CCFF00] hover:text-[#CCFF00] transition-colors">
                  <Camera className="w-6 h-6" />
                </button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
          </div>
          {/* Buttons */}
          <div className="flex gap-4">
            <button type="submit" disabled={rating === 0 || !reviewContent.trim()} className="px-8 py-3 bg-[#CCFF00] text-[#0a0a0a] font-bold uppercase tracking-wider border-4 border-[#CCFF00] hover:bg-[#0a0a0a] hover:text-[#CCFF00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {t.submit}
            </button>
            <button type="button" onClick={() => { setIsWriting(false); setRating(0); setTitle(""); setReviewContent(""); setUploadedImages([]) }} className="px-8 py-3 bg-transparent text-[#888888] font-bold uppercase tracking-wider border-4 border-[#333333] hover:border-[#888888] hover:text-white transition-colors">
              {t.cancel}
            </button>
          </div>
        </form>
      )}

      {/* Sort Options */}
      {reviews.length > 0 && (
        <div className="flex items-center gap-4 mb-8 flex-wrap">
          <span className="text-[#888888] text-sm uppercase tracking-wider">{t.sortBy}:</span>
          <div className="flex gap-2 flex-wrap">
            {[
              { value: "newest", label: t.newest },
              { value: "highest", label: t.highest },
              { value: "lowest", label: t.lowest },
              { value: "helpful", label: t.mostHelpful },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value as typeof sortBy)}
                className={`px-3 py-1 text-sm font-bold uppercase border-2 transition-colors ${
                  sortBy === option.value
                    ? "bg-[#CCFF00] text-[#0a0a0a] border-[#CCFF00]"
                    : "bg-transparent text-[#888888] border-[#333333] hover:border-[#CCFF00] hover:text-[#CCFF00]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-16 border-4 border-dashed border-[#333333]">
          <Star className="w-16 h-16 text-[#333333] mx-auto mb-4" />
          <p className="text-[#888888] text-xl uppercase tracking-wider mb-2">{t.noReviews}</p>
          <p className="text-[#666666] text-sm">{t.beFirst}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedReviews.map((review) => (
            <div key={review.id} className="border-4 border-[#333333] hover:border-[#CCFF00] transition-colors p-6">
              {/* Review Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#1a1a1a] border-2 border-[#CCFF00] flex items-center justify-center">
                    <span className="text-[#CCFF00] font-bold text-lg">{review.username.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-white font-bold uppercase">{review.username}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-4 h-4 ${s <= review.rating ? "text-[#CCFF00] fill-[#CCFF00]" : "text-[#333333]"}`} />
                        ))}
                      </div>
                      {review.is_verified_purchase && (
                        <span className="flex items-center gap-1 text-[#00FF88] text-xs font-bold uppercase">
                          <CheckCircle className="w-3 h-3" />
                          {t.verifiedPurchase}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-[#888888] text-sm">{formatDate(review.created_at)}</span>
              </div>

              {review.title && (
                <h4 className="text-white font-bold uppercase text-lg mb-2">{review.title}</h4>
              )}
              <p className="text-white leading-relaxed mb-4">{review.content}</p>

              {/* Review Images - Clickable */}
              {review.images.length > 0 && (
                <div className="flex gap-3 mb-4">
                  {review.images.map((img, imgIdx) => (
                    <motion.button
                      key={imgIdx}
                      layoutId={`focus-image-review-${review.id}-${imgIdx}`}
                      onClick={() => handleReviewImageClick(review.id, imgIdx)}
                      className="relative w-20 h-20 border-2 border-[#333333] hover:border-[#CCFF00] transition-colors overflow-hidden group cursor-zoom-in"
                    >
                      <Image
                        src={img || "/placeholder.svg"}
                        alt={`Review image ${imgIdx + 1}`}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-[#CCFF00] opacity-0 group-hover:opacity-10 transition-opacity" />
                    </motion.button>
                  ))}
                </div>
              )}

              <button className="flex items-center gap-2 text-[#888888] text-sm font-bold uppercase hover:text-[#CCFF00] transition-colors">
                <ThumbsUp className="w-4 h-4" />
                {t.helpful} ({review.helpful_count})
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}


