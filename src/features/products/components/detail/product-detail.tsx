"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useMemo, useCallback } from "react"
import { Sparkles, ChevronLeft, Minus, Plus } from "lucide-react"
import { motion } from "framer-motion"
import { products, type Language, type Product } from "@/lib/products"
import { ReviewSection } from "./review-section"
import { ImageFocusModal, type FocusImage } from "./image-focus-modal"
import { useI18n } from "@/lib/i18n/use-i18n"

interface ProductDetailProps {
  language?: Language
  productId: string
}

const sizes = ["XS", "S", "M", "L", "XL", "XXL"]

const descriptions: Record<string, { EN: string; KR: string }> = {
  HOODIES: {
    EN: "Premium heavyweight cotton blend hoodie with oversized fit. Cyber-inspired design with reflective details.",
    KR: "오버사이즈 핏의 프리미엄 헤비웨이트 후디. 리플렉티브 디테일이 포인트입니다.",
  },
  OUTER: {
    EN: "Technical outerwear crafted with cutting-edge materials. Built for the streets.",
    KR: "최신 소재로 제작한 테크 아우터. 스트리트 무드에 맞춘 기능성 디자인.",
  },
  TOPS: {
    EN: "Oversized essential with bold graphics and premium construction.",
    KR: "대담한 그래픽과 프리미엄 마감의 오버사이즈 에센셜.",
  },
  BOTTOMS: {
    EN: "Utility-focused bottoms with adjustable features and technical fabric.",
    KR: "조절 가능한 디테일과 테크 원단을 적용한 유틸리티 하의.",
  },
  ACC: {
    EN: "Statement accessories to complete your cyber-street look.",
    KR: "사이버 스트리트 룩을 완성해 주는 포인트 액세서리.",
  },
}

function generateGalleryImages(product: Product): string[] {
  const base = product.image.split("?")[0]
  return [
    `${base}?w=800&h=1000&fit=crop`,
    `${base}?w=800&h=1000&fit=crop&sat=-50`,
    `${base}?w=800&h=1000&fit=crop&flip=h`,
    `${base}?w=800&h=1000&fit=crop&blur=1`,
  ]
}

export function ProductDetail({ language, productId }: ProductDetailProps) {
  const { locale, t } = useI18n("products.detail")
  const currentLanguage: Language = language ?? locale

  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [activeThumb, setActiveThumb] = useState(0)
  const [focusOpen, setFocusOpen] = useState(false)
  const [focusIndex, setFocusIndex] = useState(0)
  const [allFocusImages, setAllFocusImages] = useState<FocusImage[]>([])

  const product = useMemo(() => products.find((p) => p.id === productId), [productId])

  const galleryImages = useMemo(() => {
    if (!product) return []
    return generateGalleryImages(product)
  }, [product])

  const productFocusImages: FocusImage[] = useMemo(() => {
    if (!product) return []
    return galleryImages.map((src, i) => ({
      id: `product-${productId}-${i}`,
      src,
      alt: `${product.name} - ${t("imageLabel")} ${i + 1}`,
      type: "product" as const,
    }))
  }, [product, galleryImages, productId, t])

  const similarProducts = useMemo(() => {
    if (!product) return []
    return products
      .filter((p) => p.id !== productId)
      .map((p) => ({ ...p, matchScore: p.tags.filter((tag) => product.tags.includes(tag)).length }))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5)
  }, [product, productId])

  const formatPrice = (p: number, curr: string) => {
    if (curr === "KRW") return `${p.toLocaleString()}원`
    return `$${p}`
  }

  const openProductFocus = useCallback((index: number) => {
    setAllFocusImages(productFocusImages)
    setFocusIndex(index)
    setFocusOpen(true)
  }, [productFocusImages])

  const openReviewFocus = useCallback((reviewImages: FocusImage[], startIndex: number) => {
    const combined = [...productFocusImages, ...reviewImages]
    setAllFocusImages(combined)
    setFocusIndex(productFocusImages.length + startIndex)
    setFocusOpen(true)
  }, [productFocusImages])

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pt-20 flex flex-col items-center justify-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white uppercase tracking-tighter mb-4">{t("notFound")}</h1>
        <Link href="/shop" className="px-8 py-4 bg-[#CCFF00] text-[#0a0a0a] text-lg font-bold uppercase tracking-wider border-4 border-[#CCFF00] hover:bg-[#0a0a0a] hover:text-[#CCFF00] transition-colors">
          {t("goBack")}
        </Link>
      </div>
    )
  }

  const categoryKey = product.category.EN
  const description = descriptions[categoryKey] || descriptions.ACC

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20">
      <div className="px-4 md:px-8 py-4 max-w-7xl mx-auto">
        <Link href="/shop" className="flex items-center gap-2 text-[#CCFF00] font-bold uppercase tracking-wider hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
          {t("back")}
        </Link>
      </div>

      <div className="px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-0">
          <div className="w-full lg:w-1/2 lg:pr-8">
            <motion.div
              layoutId={`focus-image-product-${productId}-${activeThumb}`}
              className="relative aspect-[4/5] border-4 border-[#CCFF00] overflow-hidden cursor-zoom-in group"
              onClick={() => openProductFocus(activeThumb)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter") openProductFocus(activeThumb) }}
              aria-label={t("clickToZoom")}
            >
              <div className="absolute inset-0 z-10 opacity-30 pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
              <Image src={galleryImages[activeThumb] || "/placeholder.svg"} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" priority />
              <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="px-4 py-2 bg-[#0a0a0a]/80 border-2 border-[#CCFF00] text-[#CCFF00] text-sm font-bold uppercase tracking-wider">{t("zoomHint")}</div>
              </div>
              <div className="absolute bottom-4 left-4 z-20 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 text-xs font-bold uppercase bg-[#0a0a0a]/80 text-[#CCFF00] border border-[#CCFF00]">{tag}</span>
                ))}
              </div>
            </motion.div>

            <div className="flex gap-3 mt-4">
              {galleryImages.map((img, index) => (
                <motion.button
                  key={index}
                  layoutId={index !== activeThumb ? `focus-image-product-${productId}-${index}` : undefined}
                  onClick={() => setActiveThumb(index)}
                  className={`relative w-1/4 aspect-square border-4 overflow-hidden transition-all ${activeThumb === index ? "border-[#CCFF00] shadow-[0_0_15px_rgba(204,255,0,0.3)]" : "border-[#333333] hover:border-[#CCFF00]/50 opacity-60 hover:opacity-100"}`}
                  aria-label={`Thumbnail ${index + 1}`}
                >
                  <Image src={img || "/placeholder.svg"} alt={`${product.name} thumbnail ${index + 1}`} fill className="object-cover" />
                </motion.button>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-1/2 lg:pl-8 lg:border-l-4 lg:border-[#CCFF00]">
            <p className="text-[#CCFF00] text-sm font-bold uppercase tracking-[0.3em] mb-2">{product.category[currentLanguage]}</p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white uppercase tracking-tighter mb-4 text-balance">{product.name}</h1>
            <p className="text-4xl md:text-5xl font-bold text-[#CCFF00] mb-6">{formatPrice(currentLanguage === "KR" ? product.price : product.priceUSD, currentLanguage === "KR" ? "KRW" : "USD")}</p>
            <p className="text-white text-lg leading-relaxed mb-8 border-l-4 border-[#CCFF00] pl-4">{description[currentLanguage]}</p>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <p className="text-white text-lg font-bold uppercase tracking-wider">{t("selectSize")}</p>
                <button className="text-[#CCFF00] text-sm font-bold uppercase tracking-wider hover:text-white transition-colors underline underline-offset-4">{t("sizeGuide")}</button>
              </div>
              <div className="flex flex-wrap gap-3">
                {sizes.map((size) => (
                  <button key={size} onClick={() => setSelectedSize(size)} className={`w-14 h-14 flex items-center justify-center font-bold text-lg uppercase border-4 transition-all ${selectedSize === size ? "bg-[#CCFF00] text-[#0a0a0a] border-[#CCFF00]" : "bg-[#0a0a0a] text-white border-[#CCFF00] hover:bg-[#1a1a1a]"}`}>{size}</button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <p className="text-white text-lg font-bold uppercase tracking-wider mb-4">{t("quantity")}</p>
              <div className="flex items-center border-4 border-[#CCFF00] w-fit">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-14 h-14 flex items-center justify-center text-[#CCFF00] hover:bg-[#CCFF00] hover:text-[#0a0a0a] transition-colors" aria-label="Decrease quantity"><Minus className="w-5 h-5" /></button>
                <span className="w-14 h-14 flex items-center justify-center text-white text-xl font-bold border-x-4 border-[#CCFF00]">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-14 h-14 flex items-center justify-center text-[#CCFF00] hover:bg-[#CCFF00] hover:text-[#0a0a0a] transition-colors" aria-label="Increase quantity"><Plus className="w-5 h-5" /></button>
              </div>
            </div>

            <button className="w-full py-6 bg-[#CCFF00] text-[#0a0a0a] text-2xl md:text-3xl font-bold uppercase tracking-wider border-4 border-[#CCFF00] hover:bg-[#0a0a0a] hover:text-[#CCFF00] transition-all hover:shadow-[8px_8px_0px_#CCFF00]" disabled={!selectedSize} style={{ opacity: selectedSize ? 1 : 0.6, cursor: selectedSize ? "pointer" : "not-allowed" }}>
              {t("addToVibe")}
            </button>
          </div>
        </div>
      </div>

      <section className="mt-16 md:mt-24 pb-16 md:pb-24">
        <div className="px-4 md:px-8 max-w-7xl mx-auto mb-8">
          <div className="border-b-4 border-[#CCFF00] pb-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-[#CCFF00]" />
              <h2 className="text-3xl md:text-5xl font-bold text-white uppercase tracking-tighter">{t("aiVision")}</h2>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-6 px-4 md:px-8 pb-4" style={{ width: "max-content" }}>
            {similarProducts.map((sp) => (
              <Link key={sp.id} href={`/product/${sp.id}`} className="relative w-64 sm:w-72 flex-shrink-0 border-4 border-[#CCFF00] bg-[#0a0a0a] transition-all hover:translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_#CCFF00] group cursor-pointer block">
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-[#0a0a0a] border-2 border-[#CCFF00] text-[#CCFF00]" style={{ animation: "badge-glow 2s ease-in-out infinite" }}>
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-bold">{sp.aiMatch}%</span>
                </div>
                <div className="relative aspect-square overflow-hidden bg-[#1a1a1a]">
                  <Image src={sp.image || "/placeholder.svg"} alt={sp.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-[#CCFF00] opacity-0 group-hover:opacity-10 transition-opacity" />
                </div>
                <div className="p-4 border-t-4 border-[#CCFF00]">
                  <h3 className="text-white text-lg font-bold uppercase tracking-tight mb-2 truncate">{sp.name}</h3>
                  <p className="text-[#CCFF00] text-xl font-bold">{formatPrice(currentLanguage === "KR" ? sp.price : sp.priceUSD, currentLanguage === "KR" ? "KRW" : "USD")}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ReviewSection productId={productId} language={currentLanguage} onImageClick={openReviewFocus} />

      <ImageFocusModal images={allFocusImages} currentIndex={focusIndex} isOpen={focusOpen} onClose={() => setFocusOpen(false)} onNavigate={setFocusIndex} />
    </div>
  )
}
