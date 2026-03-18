"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Sparkles, Heart } from "lucide-react"
import { useWishlist } from "@/components/providers/wishlist-provider"
import { useCart } from "@/components/providers/cart-provider"

interface ProductCardProps {
  id: string
  name: string
  price: number
  aiMatch: number
  image: string
  category: string
  currency?: "USD" | "KRW"
  showMatchBadge?: boolean
}

export function ProductCard({ id, name, price, aiMatch, image, category, currency = "USD", showMatchBadge = false }: ProductCardProps) {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()
  const [isWishlistPending, setIsWishlistPending] = useState(false)
  const [isCartPending, setIsCartPending] = useState(false)
  const [cartLabel, setCartLabel] = useState<"ADD" | "ADDING" | "ADDED" | "FAILED">("ADD")
  const isWishlisted = isInWishlist(id)
  const safeName = name.includes("?") ? id.replace(/-/g, " ").toUpperCase() : name

  const formatPrice = (p: number, curr: string) => {
    if (curr === "KRW") return `${p.toLocaleString()}원`
    return `$${p}`
  }

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isWishlistPending) return
    setIsWishlistPending(true)
    try {
      if (isWishlisted) await removeFromWishlist(id)
      else await addToWishlist(id)
    } finally {
      setIsWishlistPending(false)
    }
  }

  const handleCartClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isCartPending) return
    setIsCartPending(true)
    setCartLabel("ADDING")
    try {
      await addToCart(id, { quantity: 1 })
      setCartLabel("ADDED")
    } catch {
      setCartLabel("FAILED")
    } finally {
      setIsCartPending(false)
      window.setTimeout(() => {
        setCartLabel("ADD")
      }, 1200)
    }
  }

  return (
    <div data-testid={`product-card-${id}`} className="group relative isolate border-4 border-[#CCFF00] bg-[#0a0a0a] transition-all hover:translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_#CCFF00]">
      <button
        onClick={(e) => void handleWishlistClick(e)}
        className={`absolute top-3 left-3 z-30 p-2 border-2 transition-all duration-300 ${
          isWishlisted
            ? "bg-[#CCFF00] border-[#CCFF00] text-[#0a0a0a]"
            : "bg-[#0a0a0a]/80 border-[#CCFF00] text-[#CCFF00] hover:bg-[#CCFF00] hover:text-[#0a0a0a]"
        }`}
        type="button"
        data-testid={`wishlist-button-${id}`}
        disabled={isWishlistPending}
        onPointerDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
      </button>

      {showMatchBadge && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-[#0a0a0a] border-2 border-[#CCFF00] text-[#CCFF00]" style={{ animation: "badge-glow 2s ease-in-out infinite" }}>
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-bold">AI Match: {aiMatch}%</span>
        </div>
      )}

      <Link href={`/product/${id}`} aria-label={`View ${safeName}`} className="relative z-0 block">
        <div className="relative aspect-square overflow-hidden bg-[#1a1a1a]">
          <Image src={image || "/placeholder.svg"} alt={safeName} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
          <div className="absolute inset-0 bg-[#CCFF00] opacity-0 group-hover:opacity-10 transition-opacity" />
        </div>

        <div className="p-4 border-t-4 border-[#CCFF00]">
          <p className="text-[#CCFF00] text-xs font-bold uppercase tracking-wider mb-1">{category}</p>
          <h3 className="text-white text-xl font-bold uppercase tracking-tight mb-2 truncate">{safeName}</h3>
        </div>
      </Link>

      <div className="px-4 pb-4">
        <div className="flex items-center justify-between">
          <p className="text-[#CCFF00] text-2xl font-bold">{formatPrice(price, currency)}</p>
          <button
            onClick={(e) => void handleCartClick(e)}
            className="relative z-30 min-w-20 px-4 py-2 bg-[#CCFF00] text-[#0a0a0a] text-sm font-bold uppercase hover:bg-white transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            type="button"
            data-testid={`add-button-${id}`}
            disabled={isCartPending}
            onPointerDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
          >
            {cartLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
