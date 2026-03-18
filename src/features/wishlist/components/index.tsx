"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingBag, X } from "lucide-react"
import { useWishlist } from "@/components/providers/wishlist-provider"
import { useI18n } from "@/lib/i18n/use-i18n"
import { NoiseOverlay } from "@/components/ui"
import { createSupabaseClient } from "@/lib/supabase/client"
import { getProductsBySlugs } from "@/features/products/services"
import type { ShopProductItem } from "@/features/products/types/shop"

export function WishlistView() {
  const { locale, t } = useI18n("wishlist")
  const { wishlist, removeFromWishlist, isHydrating } = useWishlist()
  const [wishlistProducts, setWishlistProducts] = useState<ShopProductItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      const slugs = wishlist.map((item) => item.product_id)
      if (slugs.length === 0) {
        if (!isHydrating) {
          setWishlistProducts([])
        }
        return
      }

      setIsLoading(true)
      try {
        const supabase = createSupabaseClient()
        const products = await getProductsBySlugs(supabase, slugs)
        if (!cancelled) setWishlistProducts(products)
      } catch {
        // keep previous list on transient failures
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [isHydrating, wishlist])

  const wishlistIdSet = useMemo(() => new Set(wishlist.map((w) => w.product_id)), [wishlist])
  const filteredWishlistProducts = useMemo(
    () => wishlistProducts.filter((product) => wishlistIdSet.has(product.id)),
    [wishlistIdSet, wishlistProducts],
  )

  const itemCountLabel =
    filteredWishlistProducts.length === 1
      ? t("itemCountOne", { count: filteredWishlistProducts.length })
      : t("itemCountOther", { count: filteredWishlistProducts.length })

  const formatPrice = (product: ShopProductItem) => {
    return locale === "KR" ? `${product.priceKRW.toLocaleString()}원` : `$${product.priceUSD}`
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <section className="relative pt-24 pb-20 px-4 md:px-8">
        <NoiseOverlay />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="mb-12 border-b-4 border-[#CCFF00] pb-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tighter leading-none">
                  {t("title")}
                  <span className="text-[#CCFF00]">{t("titleAccent")}</span>
                </h1>
                <p className="text-[#888888] uppercase tracking-wider mt-2">{itemCountLabel}</p>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-[#CCFF00] fill-[#CCFF00]" />
                <span className="text-[#CCFF00] text-2xl font-bold">{filteredWishlistProducts.length}</span>
              </div>
            </div>
          </div>

          {(isHydrating || isLoading) ? (
            <div className="text-center py-20 border-4 border-dashed border-[#333333]">
              <p className="text-[#888888] text-xl uppercase tracking-wider">Loading wishlist...</p>
            </div>
          ) : filteredWishlistProducts.length === 0 ? (
            <div className="text-center py-20 border-4 border-dashed border-[#333333]">
              <Heart className="w-20 h-20 text-[#333333] mx-auto mb-6" />
              <p className="text-[#888888] text-2xl uppercase tracking-wider mb-2">{t("empty")}</p>
              <p className="text-[#666666] text-sm uppercase tracking-wider mb-8">{t("emptySubtitle")}</p>
              <Link
                href="/shop"
                className="inline-block px-8 py-4 bg-[#CCFF00] text-[#0a0a0a] text-xl font-bold uppercase tracking-wider border-4 border-[#CCFF00] hover:bg-[#0a0a0a] hover:text-[#CCFF00] transition-colors"
              >
                {t("shopNow")}
              </Link>
            </div>
          ) : (
            <div className="space-y-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredWishlistProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group relative border-4 border-[#CCFF00] bg-[#0a0a0a] transition-all hover:translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_#CCFF00]"
                  >
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className="absolute top-3 right-3 z-20 p-2 bg-[#0a0a0a]/80 border-2 border-[#ff4444] text-[#ff4444] hover:bg-[#ff4444] hover:text-white transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="absolute top-3 left-3 z-20 p-2 bg-[#CCFF00] border-2 border-[#CCFF00]">
                      <Heart className="w-5 h-5 text-[#0a0a0a] fill-current" />
                    </div>

                    <Link href={`/product/${product.id}`}>
                      <div className="relative aspect-square overflow-hidden bg-[#1a1a1a]">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-[#CCFF00] opacity-0 group-hover:opacity-10 transition-opacity" />
                      </div>
                    </Link>

                    <div className="p-4 border-t-4 border-[#CCFF00]">
                      <p className="text-[#CCFF00] text-xs font-bold uppercase tracking-wider mb-1">
                        {product.category[locale]}
                      </p>
                      <h3 className="text-white text-lg font-bold uppercase tracking-tight mb-2 truncate">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-[#CCFF00] text-xl font-bold">{formatPrice(product)}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 py-3 bg-[#CCFF00] text-[#0a0a0a] text-sm font-bold uppercase tracking-wider hover:bg-white transition-colors flex items-center justify-center gap-2">
                          <ShoppingBag className="w-4 h-4" />
                          {t("addToBag")}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <Link
                  href="/shop"
                  className="inline-block text-[#888888] text-sm uppercase tracking-wider hover:text-[#CCFF00] transition-colors"
                >
                  {t("continueShopping")}
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
