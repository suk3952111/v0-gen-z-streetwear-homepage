"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { MarqueeBanner } from "@/components/marquee-banner"
import { ProductGrid } from "@/components/product-grid"
import { AIStyleFinder } from "@/components/ai-style-finder"
import { Footer } from "@/components/footer"

type Language = "EN" | "KR"

export default function Home() {
  const [language, setLanguage] = useState<Language>("EN")

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Header language={language} onLanguageChange={setLanguage} />
      <HeroSection language={language} />
      <MarqueeBanner language={language} />
      <ProductGrid language={language} />
      <Footer language={language} />
      <AIStyleFinder language={language} />
    </main>
  )
}
