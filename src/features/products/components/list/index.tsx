"use client"

import { useState, useMemo } from "react"
import { AIStyleFinderButton } from "@/features/products/components/shared/ai-style-finder-button"
import { AIVisualSearchModal } from "@/features/products/components/shared/ai-visual-search-modal"
import { ProductCard } from "@/features/products/components/shared/product-card"
import { CollapsibleFilterBar } from "@/features/products/components/list/collapsible-filter-bar"
import { products, categoryMap } from "@/features/products/mocks/products"
import { useI18n } from "@/lib/i18n/use-i18n"

export function ShopView() {
  const { locale, t } = useI18n("products.shop")
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("ALL")
  const [activeTags, setActiveTags] = useState<string[]>([])

  const toggleTag = (tag: string) => {
    setActiveTags((prev) => (prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag]))
  }

  const clearFilters = () => {
    setSearchQuery("")
    setActiveCategory("ALL")
    setActiveTags([])
  }

  // TODO: Supabase 기준으로 카테고리/태그/검색 필터를 서버 쿼리로 이관 예정 (현재 mock products를 클라이언트 필터링)
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (activeCategory !== "ALL") {
        const productCategory = categoryMap[product.category.EN]
        if (productCategory !== activeCategory) return false
      }
      if (activeTags.length > 0) {
        const hasMatchingTag = activeTags.some((tag) => product.tags.includes(tag))
        if (!hasMatchingTag) return false
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const nameMatch = product.name.toLowerCase().includes(query)
        const tagMatch = product.tags.some((tag) => tag.toLowerCase().includes(query))
        if (!nameMatch && !tagMatch) return false
      }
      return true
    })
  }, [activeCategory, activeTags, searchQuery])

  const hasActiveFilters = searchQuery || activeCategory !== "ALL" || activeTags.length > 0

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <div className="fixed inset-0 opacity-20 pointer-events-none z-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

      <div className="relative z-10 pt-24">
        <CollapsibleFilterBar
          language={locale}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          activeTags={activeTags}
          onToggleTag={toggleTag}
          content={{
            title: t("title"),
            subtitle: t("subtitle"),
            searchPlaceholder: t("searchPlaceholder"),
          }}
        />

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <div className="flex items-center justify-between">
            <p className="text-[#888888] text-sm font-bold uppercase tracking-wider">{t("resultsCount", { count: filteredProducts.length })}</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-[#CCFF00] text-sm font-bold uppercase tracking-wider hover:underline">{t("clearFilters")}</button>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 pb-20">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={locale === "KR" ? product.price : product.priceUSD}
                  aiMatch={product.aiMatch}
                  image={product.image}
                  category={product.category[locale]}
                  currency={locale === "KR" ? "KRW" : "USD"}
                  showMatchBadge={false}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="relative">
                <h2 className="text-6xl md:text-8xl lg:text-9xl font-bold text-white uppercase tracking-tighter" style={{ textShadow: `2px 2px 0 #CCFF00, -2px -2px 0 #ff0080, 4px 0 0 #00ffff`, animation: "glitch-text 0.3s infinite" }}>
                  {t("noResults")}
                </h2>
              </div>
              <p className="text-[#888888] text-lg font-bold uppercase tracking-wider mt-6 mb-8">{t("noResultsSub")}</p>
              <button onClick={clearFilters} className="px-8 py-4 bg-[#CCFF00] text-[#0a0a0a] text-lg font-bold uppercase tracking-wider border-4 border-[#CCFF00] hover:bg-[#0a0a0a] hover:text-[#CCFF00] transition-colors">{t("clearFilters")}</button>
            </div>
          )}
        </div>
      </div>

      <AIStyleFinderButton onClick={() => setIsSearchModalOpen(true)} />
      <AIVisualSearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />

      <style jsx>{`
        @keyframes glitch-text {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(2px, -2px); }
          60% { transform: translate(-1px, 1px); }
          80% { transform: translate(1px, -1px); }
        }
      `}</style>
    </main>
  )
}
