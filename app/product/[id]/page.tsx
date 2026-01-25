"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/common/header"
import { Footer } from "@/components/common/footer"
import { ProductDetail } from "@/components/product-detail"
import { AIStyleFinderButton } from "@/components/shared/ai-style-finder-button"
import { AIVisualSearchModal } from "@/components/shared/ai-visual-search-modal"
import { AuthModal } from "@/components/shared/auth-modal"

type Language = "EN" | "KR"

export default function ProductPage() {
  const params = useParams()
  const productId = params.id as string
  
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
      <ProductDetail language={language} productId={productId} />
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
