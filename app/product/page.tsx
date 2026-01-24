"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { ProductDetail } from "@/components/product-detail"
import { Footer } from "@/components/footer"
import { AIStyleFinder } from "@/components/ai-style-finder"
import { AIVisualSearchModal } from "@/components/ai-visual-search-modal"

type Language = "EN" | "KR"

export default function ProductPage() {
  const [language, setLanguage] = useState<Language>("EN")
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Header language={language} onLanguageChange={setLanguage} />
      <ProductDetail language={language} />
      <Footer language={language} />
      <AIStyleFinder language={language} onClick={() => setIsModalOpen(true)} />
      <AIVisualSearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        language={language}
      />
    </main>
  )
}
