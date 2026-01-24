"use client"

import Image from "next/image"
import { useState } from "react"
import { Sparkles, ChevronLeft, Minus, Plus } from "lucide-react"

type Language = "EN" | "KR"

interface SimilarProduct {
  name: string
  price: number
  priceUSD: number
  aiMatch: number
  image: string
}

interface ProductDetailProps {
  language: Language
}

const mainProduct = {
  name: "사이버 후디 3000",
  price: 189000,
  priceUSD: 189,
  image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=1000&fit=crop",
  category: { EN: "HOODIES", KR: "후드" },
  description: {
    EN: "Oversized cyber-inspired hoodie with reflective details. Premium heavyweight cotton blend. The future of streetwear is here.",
    KR: "리플렉티브 디테일이 돋보이는 오버사이즈 사이버 후디. 프리미엄 헤비웨이트 코튼 블렌드. 스트릿웨어의 미래가 여기에."
  }
}

const similarProducts: SimilarProduct[] = [
  {
    name: "VOID PUFFER JACKET",
    price: 299000,
    priceUSD: 299,
    aiMatch: 94,
    image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400&h=400&fit=crop"
  },
  {
    name: "STATIC CREWNECK",
    price: 95000,
    priceUSD: 95,
    aiMatch: 91,
    image: "https://images.unsplash.com/photo-1578681994506-b8f463449011?w=400&h=400&fit=crop"
  },
  {
    name: "PIXEL VARSITY JACKET",
    price: 265000,
    priceUSD: 265,
    aiMatch: 89,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop"
  },
  {
    name: "네온 오버사이즈 티",
    price: 79000,
    priceUSD: 79,
    aiMatch: 87,
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop"
  },
  {
    name: "매트릭스 트랙팬츠",
    price: 120000,
    priceUSD: 120,
    aiMatch: 85,
    image: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=400&h=400&fit=crop"
  }
]

const sizes = ["XS", "S", "M", "L", "XL", "XXL"]

const content = {
  EN: {
    back: "BACK",
    selectSize: "SELECT SIZE",
    sizeGuide: "SIZE GUIDE",
    quantity: "QTY",
    addToVibe: "ADD TO VIBE",
    aiVision: "AI VISION: SIMILAR VIBES"
  },
  KR: {
    back: "뒤로",
    selectSize: "사이즈 선택",
    sizeGuide: "사이즈 가이드",
    quantity: "수량",
    addToVibe: "장바구니 담기",
    aiVision: "AI 추천: 비슷한 바이브"
  }
}

export function ProductDetail({ language }: ProductDetailProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)

  const formatPrice = (p: number, curr: string) => {
    if (curr === "KRW") {
      return `${p.toLocaleString()}원`
    }
    return `$${p}`
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20">
      {/* Back Button */}
      <div className="px-4 md:px-8 py-4 max-w-7xl mx-auto">
        <button className="flex items-center gap-2 text-[#CCFF00] font-bold uppercase tracking-wider hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
          {content[language].back}
        </button>
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
                src={mainProduct.image || "/placeholder.svg"}
                alt={mainProduct.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="w-full lg:w-1/2 lg:pl-8 lg:border-l-4 lg:border-[#CCFF00]">
            {/* Category */}
            <p className="text-[#CCFF00] text-sm font-bold uppercase tracking-[0.3em] mb-2">
              {mainProduct.category[language]}
            </p>

            {/* Product Name */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white uppercase tracking-tighter mb-4">
              {mainProduct.name}
            </h1>

            {/* Price */}
            <p className="text-4xl md:text-5xl font-bold text-[#CCFF00] mb-6">
              {formatPrice(language === "KR" ? mainProduct.price : mainProduct.priceUSD, language === "KR" ? "KRW" : "USD")}
            </p>

            {/* Description */}
            <p className="text-white text-lg leading-relaxed mb-8 border-l-4 border-[#CCFF00] pl-4">
              {mainProduct.description[language]}
            </p>

            {/* Size Selection */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <p className="text-white text-lg font-bold uppercase tracking-wider">
                  {content[language].selectSize}
                </p>
                <button className="text-[#CCFF00] text-sm font-bold uppercase tracking-wider hover:text-white transition-colors underline underline-offset-4">
                  {content[language].sizeGuide}
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
                {content[language].quantity}
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
              {content[language].addToVibe}
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
                {content[language].aiVision}
              </h2>
            </div>
          </div>
        </div>

        {/* Horizontal Scroll */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-6 px-4 md:px-8 pb-4" style={{ width: "max-content" }}>
            {similarProducts.map((product, index) => (
              <div
                key={index}
                className="relative w-64 sm:w-72 flex-shrink-0 border-4 border-[#CCFF00] bg-[#0a0a0a] transition-all hover:translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_#CCFF00] group cursor-pointer"
              >
                {/* AI Match Badge - Shown in similar vibes section */}
                <div 
                  className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-[#0a0a0a] border-2 border-[#CCFF00] text-[#CCFF00]"
                  style={{ animation: 'badge-glow 2s ease-in-out infinite' }}
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-bold">{product.aiMatch}%</span>
                </div>

                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden bg-[#1a1a1a]">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-[#CCFF00] opacity-0 group-hover:opacity-10 transition-opacity" />
                </div>

                {/* Product Info */}
                <div className="p-4 border-t-4 border-[#CCFF00]">
                  <h3 className="text-white text-lg font-bold uppercase tracking-tight mb-2 truncate">
                    {product.name}
                  </h3>
                  <p className="text-[#CCFF00] text-xl font-bold">
                    {formatPrice(language === "KR" ? product.price : product.priceUSD, language === "KR" ? "KRW" : "USD")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
