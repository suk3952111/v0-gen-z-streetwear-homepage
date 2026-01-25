"use client"

import { useState } from "react"
import { useLanguage } from "@/components/providers/language-provider"
// Common components
import { Header } from "@/components/common/header"
import { Footer } from "@/components/common/footer"
import { MarqueeBanner } from "@/components/common/marquee-banner"
// Home page components
import { HeroSection } from "@/components/home/hero-section"
import { ProductGrid } from "@/components/home/product-grid"
// Shared components
import { AIStyleFinderButton } from "@/components/shared/ai-style-finder-button"
import { AIVisualSearchModal } from "@/components/shared/ai-visual-search-modal"
import { AuthModal } from "@/components/shared/auth-modal"

export default function Home() {
  const { language, setLanguage } = useLanguage()
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Header 
        language={language} 
        onLanguageChange={setLanguage} 
        onAuthClick={() => setIsAuthModalOpen(true)}
      />
      <HeroSection language={language} />
      <MarqueeBanner language={language} />
      <ProductGrid language={language} />
      <Footer language={language} />
      <AIStyleFinderButton language={language} onClick={() => setIsSearchModalOpen(true)} />
      <AIVisualSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        language={language}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        language={language}
      />
    </main>
  )
}
