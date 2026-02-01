"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useLanguage } from "@/components/providers/language-provider"
import { useWishlist } from "@/components/providers/wishlist-provider"
import { Header } from "@/components/common/header"
import { Footer } from "@/components/common/footer"
import { AuthModal } from "@/components/shared/auth-modal"
import { Heart, ShoppingBag, X, Sparkles } from "lucide-react"
import { products } from "@/lib/products"

const content = {
  EN: {
    title: "WISH",
    titleAccent: "LIST",
    empty: "YOUR WISHLIST IS EMPTY",
    emptySubtitle: "Save items you love by clicking the heart icon",
    shopNow: "START SHOPPING",
    remove: "REMOVE",
    addToBag: "ADD TO BAG",
    viewProduct: "VIEW",
    items: "SAVED ITEMS",
    itemCount: (count: number) => `${count} ITEM${count !== 1 ? 'S' : ''} SAVED`,
    continueShopping: "CONTINUE SHOPPING",
    aiRecommendation: "AI RECOMMENDATION",
    basedOnWishlist: "Based on your wishlist vibe"
  },
  KR: {
    title: "위시",
    titleAccent: "리스트",
    empty: "위시리스트가 비어 있습니다",
    emptySubtitle: "하트 아이콘을 눌러 좋아하는 상품을 저장하세요",
    shopNow: "쇼핑 시작하기",
    remove: "삭제",
    addToBag: "장바구니 담기",
    viewProduct: "보기",
    items: "저장된 상품",
    itemCount: (count: number) => `${count}개의 상품 저장됨`,
    continueShopping: "쇼핑 계속하기",
    aiRecommendation: "AI 추천",
    basedOnWishlist: "위시리스트 바이브 기반 추천"
  },
}

export default function WishlistPage() {
  const { language, setLanguage } = useLanguage()
  const { wishlist, removeFromWishlist } = useWishlist()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  const t = content[language]

  // Get wishlist products from the products array
  const wishlistProducts = wishlist
    .map(item => products.find(p => p.id === item.product_id))
    .filter(Boolean)

  // Get AI recommendations based on wishlist tags
  const getRecommendations = () => {
    if (wishlistProducts.length === 0) return []
    
    // Collect all tags from wishlist items
    const wishlistTags = wishlistProducts.flatMap(p => p?.tags || [])
    const tagCounts = wishlistTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Find products not in wishlist that share tags
    const wishlistIds = new Set(wishlist.map(w => w.product_id))
    const recommendations = products
      .filter(p => !wishlistIds.has(p.id))
      .map(p => {
        const matchScore = p.tags.reduce((score, tag) => score + (tagCounts[tag] || 0), 0)
        return { ...p, matchScore }
      })
      .filter(p => p.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 4)
    
    return recommendations
  }

  const recommendations = getRecommendations()

  const formatPrice = (product: typeof products[0]) => {
    return language === "KR" 
      ? `${product.price.toLocaleString()}원` 
      : `$${product.priceUSD}`
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Header 
        language={language} 
        onLanguageChange={setLanguage} 
        onAuthClick={() => setIsAuthModalOpen(true)}
      />

      <section className="relative pt-24 pb-20 px-4 md:px-8">
        {/* Grainy texture overlay */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12 border-b-4 border-[#CCFF00] pb-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tighter leading-none">
                  {t.title}
                  <span className="text-[#CCFF00]">{t.titleAccent}</span>
                </h1>
                <p className="text-[#888888] uppercase tracking-wider mt-2">
                  {t.itemCount(wishlistProducts.length)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-[#CCFF00] fill-[#CCFF00]" />
                <span className="text-[#CCFF00] text-2xl font-bold">{wishlistProducts.length}</span>
              </div>
            </div>
          </div>

          {wishlistProducts.length === 0 ? (
            /* Empty State */
            <div className="text-center py-20 border-4 border-dashed border-[#333333]">
              <Heart className="w-20 h-20 text-[#333333] mx-auto mb-6" />
              <p className="text-[#888888] text-2xl uppercase tracking-wider mb-2">{t.empty}</p>
              <p className="text-[#666666] text-sm uppercase tracking-wider mb-8">{t.emptySubtitle}</p>
              <Link
                href="/shop"
                className="inline-block px-8 py-4 bg-[#CCFF00] text-[#0a0a0a] text-xl font-bold uppercase tracking-wider border-4 border-[#CCFF00] hover:bg-[#0a0a0a] hover:text-[#CCFF00] transition-colors"
              >
                {t.shopNow}
              </Link>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Wishlist Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {wishlistProducts.map((product) => product && (
                  <div
                    key={product.id}
                    className="group relative border-4 border-[#CCFF00] bg-[#0a0a0a] transition-all hover:translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_#CCFF00]"
                  >
                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className="absolute top-3 right-3 z-20 p-2 bg-[#0a0a0a]/80 border-2 border-[#ff4444] text-[#ff4444] hover:bg-[#ff4444] hover:text-white transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {/* Wishlist Heart */}
                    <div className="absolute top-3 left-3 z-20 p-2 bg-[#CCFF00] border-2 border-[#CCFF00]">
                      <Heart className="w-5 h-5 text-[#0a0a0a] fill-current" />
                    </div>

                    {/* Product Image */}
                    <Link href={`/product/${product.id}`}>
                      <div className="relative aspect-square overflow-hidden bg-[#1a1a1a]">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-[#CCFF00] opacity-0 group-hover:opacity-10 transition-opacity" />
                      </div>
                    </Link>

                    {/* Product Info */}
                    <div className="p-4 border-t-4 border-[#CCFF00]">
                      <p className="text-[#CCFF00] text-xs font-bold uppercase tracking-wider mb-1">
                        {product.category[language]}
                      </p>
                      <h3 className="text-white text-lg font-bold uppercase tracking-tight mb-2 truncate">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-[#CCFF00] text-xl font-bold">
                          {formatPrice(product)}
                        </p>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button className="flex-1 py-3 bg-[#CCFF00] text-[#0a0a0a] text-sm font-bold uppercase tracking-wider hover:bg-white transition-colors flex items-center justify-center gap-2">
                          <ShoppingBag className="w-4 h-4" />
                          {t.addToBag}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Recommendations */}
              {recommendations.length > 0 && (
                <div className="border-4 border-[#CCFF00] p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="w-6 h-6 text-[#CCFF00]" />
                    <div>
                      <h3 className="text-xl font-bold text-[#CCFF00] uppercase tracking-wider">
                        {t.aiRecommendation}
                      </h3>
                      <p className="text-[#888888] text-sm uppercase tracking-wider">
                        {t.basedOnWishlist}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {recommendations.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.id}`}
                        className="group border-2 border-[#333333] hover:border-[#CCFF00] transition-colors"
                      >
                        <div className="relative aspect-square overflow-hidden bg-[#1a1a1a]">
                          <Image
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <div className="p-3">
                          <h4 className="text-white text-sm font-bold uppercase truncate">
                            {product.name}
                          </h4>
                          <p className="text-[#CCFF00] font-bold">
                            {formatPrice(product)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Continue Shopping */}
              <div className="text-center">
                <Link
                  href="/shop"
                  className="inline-block text-[#888888] text-sm uppercase tracking-wider hover:text-[#CCFF00] transition-colors"
                >
                  {t.continueShopping}
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer language={language} />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        language={language}
      />
    </main>
  )
}
