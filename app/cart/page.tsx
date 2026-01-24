"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AuthModal } from "@/components/auth-modal"
import { Minus, Plus, X, Sparkles } from "lucide-react"

type Language = "EN" | "KR"

const content = {
  EN: {
    title: "VIBE",
    titleAccent: "BAG",
    empty: "YOUR VIBE BAG IS EMPTY",
    shopNow: "START SHOPPING",
    remove: "REMOVE",
    quantity: "QTY",
    subtotal: "SUBTOTAL",
    shipping: "SHIPPING",
    shippingValue: "CALCULATED AT CHECKOUT",
    total: "TOTAL",
    checkout: "CHECKOUT NOW",
    continueShop: "CONTINUE SHOPPING",
    aiAnalyzer: "AI VIBE ANALYZER",
    vibeScore: "YOUR STYLE VIBE",
    orderNumber: "ORDER #",
    date: "DATE",
    items: "ITEMS",
  },
  KR: {
    title: "바이브",
    titleAccent: "백",
    empty: "바이브 백이 비어있습니다",
    shopNow: "쇼핑 시작하기",
    remove: "삭제",
    quantity: "수량",
    subtotal: "소계",
    shipping: "배송비",
    shippingValue: "결제시 계산됨",
    total: "총계",
    checkout: "결제하기",
    continueShop: "쇼핑 계속하기",
    aiAnalyzer: "AI 바이브 분석기",
    vibeScore: "당신의 스타일 바이브",
    orderNumber: "주문번호 #",
    date: "날짜",
    items: "상품",
  },
}

const cartItems = [
  {
    id: 1,
    name: "사이버 후디 3000",
    price: 189,
    priceKRW: 189000,
    size: "L",
    quantity: 1,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300&h=300&fit=crop",
    vibeTag: "CYBER",
  },
  {
    id: 2,
    name: "GLITCH CARGO PANTS",
    price: 145,
    priceKRW: 145000,
    size: "M",
    quantity: 2,
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=300&h=300&fit=crop",
    vibeTag: "URBAN",
  },
  {
    id: 3,
    name: "바이너리 비니",
    price: 45,
    priceKRW: 45000,
    size: "ONE SIZE",
    quantity: 1,
    image: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=300&h=300&fit=crop",
    vibeTag: "NEON",
  },
]

const vibeCategories = [
  { name: "URBAN", percentage: 45, color: "#CCFF00" },
  { name: "CYBER", percentage: 35, color: "#00FFFF" },
  { name: "NEON", percentage: 20, color: "#FF00FF" },
]

export default function CartPage() {
  const [language, setLanguage] = useState<Language>("EN")
  const [items, setItems] = useState(cartItems)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  const t = content[language]

  const updateQuantity = (id: number, delta: number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    )
  }

  const removeItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const formatPrice = (usd: number, krw: number) => {
    return language === "KR" ? `${krw.toLocaleString()}원` : `$${usd}`
  }

  const subtotal = items.reduce(
    (acc, item) => acc + (language === "KR" ? item.priceKRW : item.price) * item.quantity,
    0
  )

  const orderNumber = "VC" + Math.random().toString(36).substring(2, 8).toUpperCase()
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })

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
            <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tighter leading-none">
              {t.title}
              <span className="text-[#CCFF00]">{t.titleAccent}</span>
            </h1>
          </div>

          {items.length === 0 ? (
            /* Empty State */
            <div className="text-center py-20">
              <p className="text-[#888888] text-2xl uppercase tracking-wider mb-8">{t.empty}</p>
              <Link
                href="/"
                className="inline-block px-8 py-4 bg-[#CCFF00] text-[#0a0a0a] text-xl font-bold uppercase tracking-wider border-4 border-[#CCFF00] hover:bg-[#0a0a0a] hover:text-[#CCFF00] transition-colors"
              >
                {t.shopNow}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-6">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="border-4 border-[#CCFF00] bg-[#0a0a0a] p-4 md:p-6 flex flex-col md:flex-row gap-6"
                  >
                    {/* Product Image */}
                    <div className="relative w-full md:w-40 h-40 border-2 border-[#CCFF00] flex-shrink-0">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                      {/* Vibe Tag */}
                      <span className="absolute top-2 left-2 px-2 py-1 bg-[#0a0a0a] border border-[#CCFF00] text-[#CCFF00] text-xs font-bold">
                        {item.vibeTag}
                      </span>
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl md:text-2xl font-bold text-white uppercase tracking-tight">
                          {item.name}
                        </h3>
                        <p className="text-[#888888] uppercase text-sm mt-1">SIZE: {item.size}</p>
                      </div>

                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <span className="text-[#888888] text-sm uppercase mr-2">{t.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-10 h-10 border-2 border-[#CCFF00] text-[#CCFF00] flex items-center justify-center hover:bg-[#CCFF00] hover:text-[#0a0a0a] transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-12 h-10 border-2 border-[#CCFF00] text-white flex items-center justify-center font-bold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-10 h-10 border-2 border-[#CCFF00] text-[#CCFF00] flex items-center justify-center hover:bg-[#CCFF00] hover:text-[#0a0a0a] transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Price and Remove */}
                        <div className="flex items-center justify-between md:justify-end gap-6">
                          <p className="text-[#CCFF00] text-2xl font-bold">
                            {formatPrice(item.price * item.quantity, item.priceKRW * item.quantity)}
                          </p>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="flex items-center gap-2 text-[#888888] hover:text-[#ff4444] transition-colors uppercase text-sm"
                            aria-label="Remove item"
                          >
                            <X className="w-5 h-5" />
                            <span className="hidden md:inline">{t.remove}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* AI Vibe Analyzer */}
                <div className="border-4 border-[#CCFF00] bg-[#0a0a0a] p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="w-6 h-6 text-[#CCFF00]" />
                    <h3 className="text-xl font-bold text-[#CCFF00] uppercase tracking-wider">
                      {t.aiAnalyzer}
                    </h3>
                  </div>

                  <p className="text-[#888888] text-sm uppercase tracking-wider mb-4">
                    {t.vibeScore}
                  </p>

                  <div className="space-y-4">
                    {vibeCategories.map((vibe) => (
                      <div key={vibe.name}>
                        <div className="flex justify-between mb-2">
                          <span className="text-white font-bold uppercase text-sm">{vibe.name}</span>
                          <span className="text-white font-bold">{vibe.percentage}%</span>
                        </div>
                        <div className="h-3 bg-[#1a1a1a] border border-[#333333]">
                          <div
                            className="h-full transition-all duration-500"
                            style={{
                              width: `${vibe.percentage}%`,
                              backgroundColor: vibe.color,
                              boxShadow: `0 0 10px ${vibe.color}`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Checkout Summary - Thermal Receipt Style */}
              <div className="lg:col-span-1">
                <div className="border-4 border-[#CCFF00] bg-[#0a0a0a] sticky top-24">
                  {/* Receipt Header */}
                  <div className="border-b-4 border-dashed border-[#CCFF00] p-6 text-center">
                    <h2 className="text-3xl font-bold text-[#CCFF00] tracking-tighter">VIBE CHECK</h2>
                    <p className="text-[#888888] text-xs uppercase tracking-[0.3em] mt-2">
                      STREETWEAR RECEIPT
                    </p>
                  </div>

                  {/* Receipt Details */}
                  <div className="p-6 space-y-4 font-mono text-sm">
                    <div className="flex justify-between text-[#888888]">
                      <span>{t.orderNumber}</span>
                      <span className="text-white">{orderNumber}</span>
                    </div>
                    <div className="flex justify-between text-[#888888]">
                      <span>{t.date}</span>
                      <span className="text-white">{currentDate}</span>
                    </div>

                    <div className="border-t border-dashed border-[#333333] my-4" />

                    {/* Items List */}
                    <div className="space-y-2">
                      <p className="text-[#888888] uppercase">{t.items}</p>
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between text-white text-xs">
                          <span className="truncate max-w-[60%]">
                            {item.quantity}x {item.name}
                          </span>
                          <span>{formatPrice(item.price * item.quantity, item.priceKRW * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-dashed border-[#333333] my-4" />

                    {/* Totals */}
                    <div className="flex justify-between text-[#888888]">
                      <span>{t.subtotal}</span>
                      <span className="text-white">
                        {language === "KR" ? `${subtotal.toLocaleString()}원` : `$${subtotal}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#888888]">
                      <span>{t.shipping}</span>
                      <span className="text-white text-xs">{t.shippingValue}</span>
                    </div>

                    <div className="border-t-4 border-[#CCFF00] my-4" />

                    <div className="flex justify-between text-xl font-bold">
                      <span className="text-white">{t.total}</span>
                      <span className="text-[#CCFF00]">
                        {language === "KR" ? `${subtotal.toLocaleString()}원` : `$${subtotal}`}
                      </span>
                    </div>
                  </div>

                  {/* Barcode */}
                  <div className="px-6 pb-6">
                    <div className="bg-white p-4">
                      <div className="flex items-end justify-center gap-[2px] h-16">
                        {Array.from({ length: 50 }).map((_, i) => (
                          <div
                            key={i}
                            className="bg-black"
                            style={{
                              width: Math.random() > 0.5 ? "2px" : "4px",
                              height: `${60 + Math.random() * 40}%`,
                            }}
                          />
                        ))}
                      </div>
                      <p className="text-center text-black text-xs font-mono mt-2">{orderNumber}</p>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <div className="p-6 pt-0 space-y-4">
                    <button className="w-full py-4 bg-[#CCFF00] text-[#0a0a0a] text-xl font-bold uppercase tracking-wider border-4 border-[#CCFF00] hover:bg-[#0a0a0a] hover:text-[#CCFF00] transition-colors">
                      {t.checkout}
                    </button>
                    <Link
                      href="/"
                      className="block text-center text-[#888888] text-sm uppercase tracking-wider hover:text-[#CCFF00] transition-colors"
                    >
                      {t.continueShop}
                    </Link>
                  </div>
                </div>
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
