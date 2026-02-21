"use client"

import { useState } from "react"
import { MarqueeBanner } from "@/features/products/components/home/marquee-banner"
import { HeroSection } from "@/features/products/components/home/hero-section"
import { ProductGrid } from "@/features/products/components/home/product-grid"
import { AIStyleFinderButton } from "@/features/products/components/shared/ai-style-finder-button"
import { AIVisualSearchModal } from "@/features/products/components/shared/ai-visual-search-modal"

export function HomeView() {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <HeroSection />
      <MarqueeBanner />
      <ProductGrid />
      <AIStyleFinderButton onClick={() => setIsSearchModalOpen(true)} />
      <AIVisualSearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </main>
  )
}
