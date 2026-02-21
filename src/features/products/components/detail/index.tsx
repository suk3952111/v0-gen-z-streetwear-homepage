"use client"

import { useState } from "react"
import { ProductDetail } from "@/features/products/components/detail/product-detail"
import { AIStyleFinderButton } from "@/features/products/components/shared/ai-style-finder-button"
import { AIVisualSearchModal } from "@/features/products/components/shared/ai-visual-search-modal"

interface ProductViewProps {
  productId: string
}

export function ProductView({ productId }: ProductViewProps) {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <ProductDetail productId={productId} />
      <AIStyleFinderButton onClick={() => setIsSearchModalOpen(true)} />
      <AIVisualSearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </main>
  )
}
