"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { MarqueeBanner } from "@/components/marquee-banner"
import { ProductGrid } from "@/components/product-grid"
import { AIStyleFinder } from "@/components/ai-style-finder"
import { AIVisualSearchModal } from "@/components/ai-visual-search-modal"
import { AuthModal } from "@/components/auth-modal"
import { Footer } from "@/components/footer"

type Language = "EN" | "KR"

export default function Home() {
  const [language, setLanguage] = useState<Language>("EN")
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
      <AIStyleFinder language={language} onClick={() => setIsSearchModalOpen(true)} />
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
