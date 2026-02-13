"use client"

import { useState, useMemo } from "react"
import { useLanguage } from "@/components/providers/language-provider"
import { Header } from "@/components/common/header"
import { Footer } from "@/components/common/footer"
import { AuthModal } from "@/components/shared/auth-modal"
import { AIStyleFinderButton } from "@/components/shared/ai-style-finder-button"
import { AIVisualSearchModal } from "@/components/shared/ai-visual-search-modal"
import { ProductCard } from "@/components/product-card"
import { CollapsibleFilterBar } from "@/components/shop/collapsible-filter-bar"
import { products, categoryMap } from "@/lib/products"

const pageContent = {
  EN: {
    title: "ALL DROPS",
    subtitle: "BROWSE THE ARCHIVE",
    searchPlaceholder: "SEARCH PRODUCTS OR #TAGS...",
    resultsCount: (count: number) => `${count} ITEMS FOUND`,
    noResults: "VIBE NOT FOUND",
    noResultsSub: "TRY A DIFFERENT SEARCH OR TAG",
    clearFilters: "CLEAR ALL FILTERS"
  },
  KR: {
    title: "ALL DROPS",
    subtitle: "전체 아카이브",
    searchPlaceholder: "상품명 또는 #태그로 검색...",
    resultsCount: (count: number) => `${count}개의 결과`,
    noResults: "검색 결과 없음",
    noResultsSub: "다른 검색어나 태그를 입력해보세요",
    clearFilters: "필터 초기화"
  }
}

export default function ShopPage() {
  const { language, setLanguage } = useLanguage()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("ALL")
  const [activeTags, setActiveTags] = useState<string[]>([])

  const t = pageContent[language]

  const toggleTag = (tag: string) => {
    setActiveTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const clearFilters = () => {
    setSearchQuery("")
    setActiveCategory("ALL")
    setActiveTags([])
  }

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Category filter
      if (activeCategory !== "ALL") {
        const productCategory = categoryMap[product.category.EN]
        if (productCategory !== activeCategory) return false
      }

      // Tag filter
      if (activeTags.length > 0) {
        const hasMatchingTag = activeTags.some(tag => product.tags.includes(tag))
        if (!hasMatchingTag) return false
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const nameMatch = product.name.toLowerCase().includes(query)
        const tagMatch = product.tags.some(tag => tag.toLowerCase().includes(query))
        if (!nameMatch && !tagMatch) return false
      }

      return true
    })
  }, [activeCategory, activeTags, searchQuery])

  const hasActiveFilters = searchQuery || activeCategory !== "ALL" || activeTags.length > 0

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Header 
        language={language} 
        onLanguageChange={setLanguage}
        onAuthClick={() => setIsAuthModalOpen(true)}
      />

      {/* Grainy texture overlay */}
      <div 
        className="fixed inset-0 opacity-20 pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 pt-24">
        {/* Collapsible Sticky Filter Bar */}
        <CollapsibleFilterBar
          language={language}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          activeTags={activeTags}
          onToggleTag={toggleTag}
          content={{
            title: t.title,
            subtitle: t.subtitle,
            searchPlaceholder: t.searchPlaceholder,
          }}
        />

        {/* Results Count & Clear */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <div className="flex items-center justify-between">
            <p className="text-[#888888] text-sm font-bold uppercase tracking-wider">
              {t.resultsCount(filteredProducts.length)}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-[#CCFF00] text-sm font-bold uppercase tracking-wider hover:underline"
              >
                {t.clearFilters}
              </button>
            )}
          </div>
        </div>

        {/* Product Grid or Empty State */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 pb-20">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={language === "KR" ? product.price : product.priceUSD}
                  aiMatch={product.aiMatch}
                  image={product.image}
                  category={product.category[language]}
                  currency={language === "KR" ? "KRW" : "USD"}
                  showMatchBadge={false}
                />
              ))}
            </div>
          ) : (
            /* Empty State - VIBE NOT FOUND */
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="relative">
                <h2 
                  className="text-6xl md:text-8xl lg:text-9xl font-bold text-white uppercase tracking-tighter"
                  style={{
                    textShadow: `
                      2px 2px 0 #CCFF00,
                      -2px -2px 0 #ff0080,
                      4px 0 0 #00ffff
                    `,
                    animation: 'glitch-text 0.3s infinite'
                  }}
                >
                  {t.noResults}
                </h2>
                {/* Glitch layers */}
                <h2 
                  className="absolute inset-0 text-6xl md:text-8xl lg:text-9xl font-bold text-transparent uppercase tracking-tighter"
                  style={{
                    textShadow: '-3px 0 #ff0080',
                    animation: 'glitch-1 0.4s infinite',
                    clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)'
                  }}
                  aria-hidden="true"
                >
                  {t.noResults}
                </h2>
                <h2 
                  className="absolute inset-0 text-6xl md:text-8xl lg:text-9xl font-bold text-transparent uppercase tracking-tighter"
                  style={{
                    textShadow: '3px 0 #00ffff',
                    animation: 'glitch-2 0.4s infinite',
                    clipPath: 'polygon(0 55%, 100% 55%, 100% 100%, 0 100%)'
                  }}
                  aria-hidden="true"
                >
                  {t.noResults}
                </h2>
              </div>
              <p className="text-[#888888] text-lg font-bold uppercase tracking-wider mt-6 mb-8">
                {t.noResultsSub}
              </p>
              <button
                onClick={clearFilters}
                className="px-8 py-4 bg-[#CCFF00] text-[#0a0a0a] text-lg font-bold uppercase tracking-wider border-4 border-[#CCFF00] hover:bg-[#0a0a0a] hover:text-[#CCFF00] transition-colors"
              >
                {t.clearFilters}
              </button>
            </div>
          )}
        </div>
      </div>

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

      {/* Glitch animation styles */}
      <style jsx>{`
        @keyframes glitch-text {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(2px, -2px); }
          60% { transform: translate(-1px, 1px); }
          80% { transform: translate(1px, -1px); }
        }
        @keyframes glitch-1 {
          0%, 100% { transform: translate(0); opacity: 0.8; }
          20% { transform: translate(-3px, 0); }
          40% { transform: translate(3px, 0); }
          60% { transform: translate(-2px, 0); }
          80% { transform: translate(2px, 0); }
        }
        @keyframes glitch-2 {
          0%, 100% { transform: translate(0); opacity: 0.8; }
          20% { transform: translate(3px, 0); }
          40% { transform: translate(-3px, 0); }
          60% { transform: translate(2px, 0); }
          80% { transform: translate(-2px, 0); }
        }
      `}</style>
    </main>
  )
}
