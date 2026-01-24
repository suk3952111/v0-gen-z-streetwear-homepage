"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { ProductDetail } from "@/components/product-detail"
import { Footer } from "@/components/footer"
import { AIStyleFinder } from "@/components/ai-style-finder"
import { AIVisualSearchModal } from "@/components/ai-visual-search-modal"
import { AuthModal } from "@/components/auth-modal"

type Language = "EN" | "KR"

export default function ProductPage() {
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
      <ProductDetail language={language} />
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
