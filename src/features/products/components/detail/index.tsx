"use client"

import { useState } from "react"
import { ProductDetail } from "@/features/products/components/detail/product-detail"
import { AIStyleFinderButton } from "@/features/products/components/shared/ai-style-finder-button"
import { AIVisualSearchModal } from "@/features/products/components/shared/ai-visual-search-modal"
import type { ShopProductItem } from "@/features/products/types/shop"

interface ProductViewProps {
  productId: string
  initialProduct: ShopProductItem | null
}

export function ProductView({ productId, initialProduct }: ProductViewProps) {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <ProductDetail productId={productId} initialProduct={initialProduct} />
      <AIStyleFinderButton onClick={() => setIsSearchModalOpen(true)} />
      <AIVisualSearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </main>
  )
}
