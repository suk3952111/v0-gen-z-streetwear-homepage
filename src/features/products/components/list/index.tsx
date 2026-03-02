"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { AIStyleFinderButton } from "@/features/products/components/shared/ai-style-finder-button"
import { AIVisualSearchModal } from "@/features/products/components/shared/ai-visual-search-modal"
import { ProductCard } from "@/features/products/components/shared/product-card"
import { CollapsibleFilterBar } from "@/features/products/components/list/collapsible-filter-bar"
import { useI18n } from "@/lib/i18n/use-i18n"
import { loadShopProductsAction } from "@/features/products/actions/load-shop-products"
import type { ShopInitialPayload, ShopProductItem } from "@/features/products/types/shop"

function useThrottledValue<T>(value: T, intervalMs: number) {
  const [throttled, setThrottled] = useState(value)
  const lastRunRef = useRef(0)

  useEffect(() => {
    const now = Date.now()
    const elapsed = now - lastRunRef.current
    const remaining = intervalMs - elapsed

    if (remaining <= 0) {
      lastRunRef.current = now
      setThrottled(value)
      return
    }

    const timer = setTimeout(() => {
      lastRunRef.current = Date.now()
      setThrottled(value)
    }, remaining)

    return () => clearTimeout(timer)
  }, [intervalMs, value])

  return throttled
}

type ShopViewProps = {
  initialData: ShopInitialPayload
}

export function ShopView({ initialData }: ShopViewProps) {
  const { locale, t } = useI18n("products.shop")
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [activeTags, setActiveTags] = useState<string[]>([])
  const [products, setProducts] = useState<ShopProductItem[]>(initialData.page.items)
  const [nextOffset, setNextOffset] = useState(initialData.page.nextOffset)
  const [hasMore, setHasMore] = useState(initialData.page.hasMore)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const loadMoreLockRef = useRef(false)
  const skipFirstRefreshRef = useRef(true)

  const throttledSearchQuery = useThrottledValue(searchQuery, 400)

  const toggleTag = (tag: string) => {
    setActiveTags((prev) => (prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag]))
  }

  const clearFilters = () => {
    setSearchQuery("")
    setActiveCategory("all")
    setActiveTags([])
  }

  const sortedTags = useMemo(() => [...activeTags].sort(), [activeTags])
  const filterKey = `${throttledSearchQuery}|${activeCategory}|${sortedTags.join(",")}`

  useEffect(() => {
    if (skipFirstRefreshRef.current) {
      skipFirstRefreshRef.current = false
      return
    }

    let cancelled = false
    const refresh = async () => {
      setIsRefreshing(true)
      const result = await loadShopProductsAction({
        searchQuery: throttledSearchQuery,
        categorySlug: activeCategory,
        tagSlugs: sortedTags,
        offset: 0,
        limit: 16,
      })
      if (cancelled) return
      setProducts(result.data.items)
      setNextOffset(result.data.nextOffset)
      setHasMore(result.data.hasMore)
      setIsRefreshing(false)
    }

    refresh()
    return () => {
      cancelled = true
    }
  }, [filterKey, throttledSearchQuery, activeCategory, sortedTags])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      async (entries) => {
        const [entry] = entries
        if (!entry?.isIntersecting) return
        if (loadMoreLockRef.current || isRefreshing || !hasMore) return

        loadMoreLockRef.current = true
        setIsLoadingMore(true)
        try {
          const result = await loadShopProductsAction({
            searchQuery: throttledSearchQuery,
            categorySlug: activeCategory,
            tagSlugs: sortedTags,
            offset: nextOffset,
            limit: 16,
          })

          setProducts((prev) => {
            const idSet = new Set(prev.map((item) => item.id))
            const uniqueNext = result.data.items.filter((item) => !idSet.has(item.id))
            return [...prev, ...uniqueNext]
          })
          setNextOffset(result.data.nextOffset)
          setHasMore(result.data.hasMore)
        } finally {
          setIsLoadingMore(false)
          loadMoreLockRef.current = false
        }
      },
      { rootMargin: "300px 0px" },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [activeCategory, hasMore, isRefreshing, nextOffset, sortedTags, throttledSearchQuery])

  const hasActiveFilters = searchQuery || activeCategory !== "all" || activeTags.length > 0

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <div
        className="fixed inset-0 opacity-20 pointer-events-none z-0"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
        }}
      />

      <div className="relative z-10 pt-24">
        <CollapsibleFilterBar
          language={locale}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          activeTags={activeTags}
          onToggleTag={toggleTag}
          categories={initialData.categories}
          tags={initialData.tags}
          content={{
            title: t("title"),
            subtitle: t("subtitle"),
            searchPlaceholder: t("searchPlaceholder"),
          }}
        />

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <div className="flex items-center justify-between">
            <p className="text-[#888888] text-sm font-bold uppercase tracking-wider">
              {t("resultsCount", { count: products.length })}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-[#CCFF00] text-sm font-bold uppercase tracking-wider hover:underline"
              >
                {t("clearFilters")}
              </button>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 pb-20">
          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={locale === "KR" ? product.priceKRW : product.priceUSD}
                    aiMatch={product.aiMatch}
                    image={product.image}
                    category={product.category[locale]}
                    currency={locale === "KR" ? "KRW" : "USD"}
                    showMatchBadge={false}
                  />
                ))}
              </div>
              <div ref={sentinelRef} className="mt-8 flex items-center justify-center">
                {(isLoadingMore || isRefreshing) ? (
                  <div className="w-full max-w-md border-2 border-[#CCFF00] bg-[#0a0a0a] px-4 py-3 text-center">
                    <p className="text-[#CCFF00] text-xs uppercase tracking-[0.25em] animate-pulse">
                      Loading more products...
                    </p>
                  </div>
                ) : hasMore ? (
                  <div className="h-10" />
                ) : (
                  <p className="text-[#666666] text-xs uppercase tracking-wider">No more products</p>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="relative">
                <h2
                  className="text-6xl md:text-8xl lg:text-9xl font-bold text-white uppercase tracking-tighter"
                  style={{
                    textShadow: "2px 2px 0 #CCFF00, -2px -2px 0 #ff0080, 4px 0 0 #00ffff",
                    animation: "glitch-text 0.3s infinite",
                  }}
                >
                  {t("noResults")}
                </h2>
              </div>
              <p className="text-[#888888] text-lg font-bold uppercase tracking-wider mt-6 mb-8">
                {t("noResultsSub")}
              </p>
              <button
                onClick={clearFilters}
                className="px-8 py-4 bg-[#CCFF00] text-[#0a0a0a] text-lg font-bold uppercase tracking-wider border-4 border-[#CCFF00] hover:bg-[#0a0a0a] hover:text-[#CCFF00] transition-colors"
              >
                {t("clearFilters")}
              </button>
            </div>
          )}
        </div>
      </div>

      <AIStyleFinderButton onClick={() => setIsSearchModalOpen(true)} />
      <AIVisualSearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />

      <style jsx>{`
        @keyframes glitch-text {
          0%,
          100% {
            transform: translate(0);
          }
          20% {
            transform: translate(-2px, 2px);
          }
          40% {
            transform: translate(2px, -2px);
          }
          60% {
            transform: translate(-1px, 1px);
          }
          80% {
            transform: translate(1px, -1px);
          }
        }
      `}</style>
    </main>
  )
}
