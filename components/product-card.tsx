"use client"

import Image from "next/image"
import Link from "next/link"
import { Sparkles } from "lucide-react"

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
  const formatPrice = (p: number, curr: string) => {
    if (curr === "KRW") {
      return `${p.toLocaleString()}원`
    }
    return `$${p}`
  }
  return (
    <Link href={`/product/${id}`} className="group relative border-4 border-[#CCFF00] bg-[#0a0a0a] transition-all hover:translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_#CCFF00] block">
      {/* AI Match Badge - Only shown when showMatchBadge is true */}
      {showMatchBadge && (
        <div 
          className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-[#0a0a0a] border-2 border-[#CCFF00] text-[#CCFF00]"
          style={{
            animation: 'badge-glow 2s ease-in-out infinite'
          }}
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-bold">AI Match: {aiMatch}%</span>
        </div>
      )}

      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-[#1a1a1a]">
        <Image
          src={image || "/placeholder.svg"}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110 grayscale group-hover:grayscale-0"
        />
        <div className="absolute inset-0 bg-[#CCFF00] opacity-0 group-hover:opacity-10 transition-opacity" />
      </div>

      {/* Product Info */}
      <div className="p-4 border-t-4 border-[#CCFF00]">
        <p className="text-[#CCFF00] text-xs font-bold uppercase tracking-wider mb-1">
          {category}
        </p>
        <h3 className="text-white text-xl font-bold uppercase tracking-tight mb-2 truncate">
          {name}
        </h3>
        <div className="flex items-center justify-between">
          <p className="text-[#CCFF00] text-2xl font-bold">
            {formatPrice(price, currency)}
          </p>
          <button className="px-4 py-2 bg-[#CCFF00] text-[#0a0a0a] text-sm font-bold uppercase hover:bg-white transition-colors">
            ADD
          </button>
        </div>
      </div>
    </Link>
  )
}
