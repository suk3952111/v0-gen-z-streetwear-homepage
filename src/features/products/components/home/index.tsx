"use client"

import { useState } from "react"
import { MarqueeBanner } from "@/features/products/components/home/marquee-banner"
import { HeroSection } from "@/features/products/components/home/hero-section"
import { ProductGrid } from "@/features/products/components/home/product-grid"
import { AIStyleFinderButton } from "@/features/products/components/shared/ai-style-finder-button"
import { AIVisualSearchModal } from "@/features/products/components/shared/ai-visual-search-modal"
import type { ShopProductItem } from "@/features/products/types/shop"

type HomeViewProps = {
  initialProducts: ShopProductItem[]
}

export function HomeView({ initialProducts }: HomeViewProps) {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <HeroSection />
      <MarqueeBanner />
      <ProductGrid products={initialProducts} />
      <AIStyleFinderButton onClick={() => setIsSearchModalOpen(true)} />
      <AIVisualSearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </main>
  )
}
