"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useMemo } from "react"
import { Sparkles, ChevronLeft, Minus, Plus } from "lucide-react"
import { products, type Language, type Product } from "@/lib/products"

interface ProductDetailProps {
  language: Language
  productId: string
}

const sizes = ["XS", "S", "M", "L", "XL", "XXL"]

const content = {
  EN: {
    back: "BACK",
    selectSize: "SELECT SIZE",
    sizeGuide: "SIZE GUIDE",
    quantity: "QTY",
    addToVibe: "ADD TO VIBE",
    aiVision: "AI VISION: SIMILAR VIBES",
    notFound: "PRODUCT NOT FOUND",
    goBack: "GO BACK TO SHOP"
  },
  KR: {
    back: "뒤로가기",
    selectSize: "사이즈 선택",
    sizeGuide: "사이즈 가이드",
    quantity: "수량",
    addToVibe: "바이브 백에 담기",
    aiVision: "AI 추천: 유사한 스타일",
    notFound: "상품을 찾을 수 없습니다",
    goBack: "상점으로 돌아가기"
  }
}

// Product descriptions by category
const descriptions: Record<string, { EN: string; KR: string }> = {
  HOODIES: {
    EN: "Premium heavyweight cotton blend hoodie with oversized fit. Cyber-inspired design with reflective details. The future of streetwear is here.",
    KR: "오버사이즈 핏의 프리미엄 헤비웨이트 코튼 블렌드 후디. 리플렉티브 디테일이 돋보이는 사이버 감성 디자인. 스트릿웨어의 미래가 여기에."
  },
  OUTER: {
    EN: "Technical outerwear crafted with cutting-edge materials. Weather-resistant construction meets urban style. Built for the streets, designed for the future.",
    KR: "최첨단 소재로 제작된 테크니컬 아우터. 날씨에 강한 구조와 도시적 스타일의 만남. 거리를 위해 만들어지고, 미래를 위해 디자인되었습니다."
  },
  TOPS: {
    EN: "Oversized streetwear essential with bold graphics and premium construction. Soft touch fabric meets hard-hitting design. Your new go-to piece.",
    KR: "대담한 그래픽과 프리미엄 구조의 오버사이즈 스트릿웨어 에센셜. 부드러운 터치의 원단과 강렬한 디자인의 만남. 새로운 필수 아이템."
  },
  BOTTOMS: {
    EN: "Utility-focused bottoms with multiple pockets and adjustable features. Technical fabric meets street style. Move freely, look sharp.",
    KR: "다수의 포켓과 조절 가능한 기능을 갖춘 유틸리티 포커스 하의. 테크니컬 원단과 스트릿 스타일의 만남. 자유롭게 움직이고, 날카롭게 보이세요."
  },
  ACC: {
    EN: "Statement accessories to complete your cyber-street look. Functional design meets bold aesthetics. The finishing touch your fit needs.",
    KR: "사이버-스트릿 룩을 완성하는 스테이트먼트 악세서리. 기능적 디자인과 대담한 미학의 만남. 당신의 핏에 필요한 마무리 터치."
  }
}

export function ProductDetail({ language, productId }: ProductDetailProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)

  // Find the product by ID
  const product = useMemo(() => {
    return products.find(p => p.id === productId)
  }, [productId])

  // Get similar products based on shared tags
  const similarProducts = useMemo(() => {
    if (!product) return []
    return products
      .filter(p => p.id !== productId)
      .map(p => ({
        ...p,
        matchScore: p.tags.filter(tag => product.tags.includes(tag)).length
      }))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5)
  }, [product, productId])

  const formatPrice = (p: number, curr: string) => {
    if (curr === "KRW") {
      return `${p.toLocaleString()}원`
    }
    return `$${p}`
  }

  const t = content[language]

  // Product not found state
  if (!product) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pt-20 flex flex-col items-center justify-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white uppercase tracking-tighter mb-4">
          {t.notFound}
        </h1>
        <Link 
          href="/shop"
          className="px-8 py-4 bg-[#CCFF00] text-[#0a0a0a] text-lg font-bold uppercase tracking-wider border-4 border-[#CCFF00] hover:bg-[#0a0a0a] hover:text-[#CCFF00] transition-colors"
        >
          {t.goBack}
        </Link>
      </div>
    )
  }

  // Get category key for description
  const categoryKey = product.category.EN === "HOODIES" ? "HOODIES" 
    : product.category.EN === "OUTER" ? "OUTER"
    : product.category.EN === "TOPS" ? "TOPS"
    : product.category.EN === "BOTTOMS" ? "BOTTOMS"
    : "ACC"

  const description = descriptions[categoryKey]

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20">
      {/* Back Button */}
      <div className="px-4 md:px-8 py-4 max-w-7xl mx-auto">
        <Link 
          href="/shop"
          className="flex items-center gap-2 text-[#CCFF00] font-bold uppercase tracking-wider hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          {t.back}
        </Link>
      </div>

      {/* Main Product Section */}
      <div className="px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-0">
          {/* Left: Product Image */}
          <div className="w-full lg:w-1/2 lg:pr-8">
            <div className="relative aspect-[4/5] border-4 border-[#CCFF00] overflow-hidden">
              {/* Grainy texture overlay */}
              <div 
                className="absolute inset-0 z-10 opacity-30 pointer-events-none mix-blend-overlay"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
              />
              
              <Image
                src={product.image.replace('w=600&h=600', 'w=800&h=1000') || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />

              {/* Tags on image */}
              <div className="absolute bottom-4 left-4 z-20 flex flex-wrap gap-2">
                {product.tags.map(tag => (
                  <span 
                    key={tag}
                    className="px-2 py-1 text-xs font-bold uppercase bg-[#0a0a0a]/80 text-[#CCFF00] border border-[#CCFF00]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="w-full lg:w-1/2 lg:pl-8 lg:border-l-4 lg:border-[#CCFF00]">
            {/* Category */}
            <p className="text-[#CCFF00] text-sm font-bold uppercase tracking-[0.3em] mb-2">
              {product.category[language]}
            </p>

            {/* Product Name */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white uppercase tracking-tighter mb-4">
              {product.name}
            </h1>

            {/* Price */}
            <p className="text-4xl md:text-5xl font-bold text-[#CCFF00] mb-6">
              {formatPrice(language === "KR" ? product.price : product.priceUSD, language === "KR" ? "KRW" : "USD")}
            </p>

            {/* Description */}
            <p className="text-white text-lg leading-relaxed mb-8 border-l-4 border-[#CCFF00] pl-4">
              {description[language]}
            </p>

            {/* Size Selection */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <p className="text-white text-lg font-bold uppercase tracking-wider">
                  {t.selectSize}
                </p>
                <button className="text-[#CCFF00] text-sm font-bold uppercase tracking-wider hover:text-white transition-colors underline underline-offset-4">
                  {t.sizeGuide}
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-14 h-14 flex items-center justify-center font-bold text-lg uppercase border-4 transition-all ${
                      selectedSize === size
                        ? "bg-[#CCFF00] text-[#0a0a0a] border-[#CCFF00]"
                        : "bg-[#0a0a0a] text-white border-[#CCFF00] hover:bg-[#1a1a1a]"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <p className="text-white text-lg font-bold uppercase tracking-wider mb-4">
                {t.quantity}
              </p>
              <div className="flex items-center border-4 border-[#CCFF00] w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-14 h-14 flex items-center justify-center text-[#CCFF00] hover:bg-[#CCFF00] hover:text-[#0a0a0a] transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-14 h-14 flex items-center justify-center text-white text-xl font-bold border-x-4 border-[#CCFF00]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-14 h-14 flex items-center justify-center text-[#CCFF00] hover:bg-[#CCFF00] hover:text-[#0a0a0a] transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Add to Vibe Button */}
            <button 
              className="w-full py-6 bg-[#CCFF00] text-[#0a0a0a] text-2xl md:text-3xl font-bold uppercase tracking-wider border-4 border-[#CCFF00] hover:bg-[#0a0a0a] hover:text-[#CCFF00] transition-all hover:shadow-[8px_8px_0px_#CCFF00]"
              disabled={!selectedSize}
              style={{
                opacity: selectedSize ? 1 : 0.6,
                cursor: selectedSize ? "pointer" : "not-allowed"
              }}
            >
              {t.addToVibe}
            </button>
          </div>
        </div>
      </div>

      {/* AI Vision: Similar Vibes Section */}
      <section className="mt-16 md:mt-24 pb-16 md:pb-24">
        <div className="px-4 md:px-8 max-w-7xl mx-auto mb-8">
          <div className="border-b-4 border-[#CCFF00] pb-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-[#CCFF00]" />
              <h2 className="text-3xl md:text-5xl font-bold text-white uppercase tracking-tighter">
                {t.aiVision}
              </h2>
            </div>
          </div>
        </div>

        {/* Horizontal Scroll */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-6 px-4 md:px-8 pb-4" style={{ width: "max-content" }}>
            {similarProducts.map((similarProduct) => (
              <Link
                key={similarProduct.id}
                href={`/product/${similarProduct.id}`}
                className="relative w-64 sm:w-72 flex-shrink-0 border-4 border-[#CCFF00] bg-[#0a0a0a] transition-all hover:translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_#CCFF00] group cursor-pointer block"
              >
                {/* AI Match Badge */}
                <div 
                  className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-[#0a0a0a] border-2 border-[#CCFF00] text-[#CCFF00]"
                  style={{ animation: 'badge-glow 2s ease-in-out infinite' }}
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-bold">{similarProduct.aiMatch}%</span>
                </div>

                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden bg-[#1a1a1a]">
                  <Image
                    src={similarProduct.image || "/placeholder.svg"}
                    alt={similarProduct.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-[#CCFF00] opacity-0 group-hover:opacity-10 transition-opacity" />
                </div>

                {/* Product Info */}
                <div className="p-4 border-t-4 border-[#CCFF00]">
                  <h3 className="text-white text-lg font-bold uppercase tracking-tight mb-2 truncate">
                    {similarProduct.name}
                  </h3>
                  <p className="text-[#CCFF00] text-xl font-bold">
                    {formatPrice(language === "KR" ? similarProduct.price : similarProduct.priceUSD, language === "KR" ? "KRW" : "USD")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
