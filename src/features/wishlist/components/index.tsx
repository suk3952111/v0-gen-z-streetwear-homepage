"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingBag, X } from "lucide-react"
import { useWishlist } from "@/components/providers/wishlist-provider"
import { useCart } from "@/components/providers/cart-provider"
import { useI18n } from "@/lib/i18n/use-i18n"
import { NoiseOverlay } from "@/components/ui"
import { createSupabaseClient } from "@/lib/supabase/client"
import { getProductsBySlugs } from "@/features/products/services"
import type { ShopProductItem } from "@/features/products/types/shop"

export function WishlistView() {
  const { locale, t } = useI18n("wishlist")
  const { wishlist, removeFromWishlist, isHydrating } = useWishlist()
  const { addToCart } = useCart()
  const [wishlistProducts, setWishlistProducts] = useState<ShopProductItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [pendingProductId, setPendingProductId] = useState<string | null>(null)
  const [sizePickerProduct, setSizePickerProduct] = useState<ShopProductItem | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)

  const getAvailableSizes = (product: ShopProductItem) => {
    if (product.id.startsWith("acc-")) return ["ONE SIZE"]
    if (product.sizes.length === 0) return ["ONE SIZE"]
    return product.sizes
  }

  const addProductToBag = async (product: ShopProductItem, size: string) => {
    setPendingProductId(product.id)
    try {
      await addToCart(product.id, { quantity: 1, size })
      await removeFromWishlist(product.id)
    } finally {
      setPendingProductId(null)
    }
  }

  const closeSizePicker = () => {
    setSizePickerProduct(null)
    setSelectedSize(null)
  }

  const handleAddToBag = async (product: ShopProductItem) => {
    const availableSizes = getAvailableSizes(product)
    if (availableSizes.length === 1 && availableSizes[0] === "ONE SIZE") {
      await addProductToBag(product, "ONE SIZE")
      return
    }

    setSizePickerProduct(product)
    setSelectedSize(availableSizes[0] ?? null)
  }

  const handleConfirmSize = async () => {
    if (!sizePickerProduct || !selectedSize) return
    await addProductToBag(sizePickerProduct, selectedSize)
    closeSizePicker()
  }

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      const slugs = [
        ...new Set(
          wishlist
            .map((item) => item.product_id)
            .filter((slug): slug is string => typeof slug === "string" && slug.trim().length > 0),
        ),
      ]
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
        // Keep the current list on transient failures.
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()
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
      <section className="relative px-4 pb-20 pt-24 md:px-8">
        <NoiseOverlay />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mb-12 border-b-4 border-[#CCFF00] pb-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-6xl font-bold leading-none tracking-tighter text-white md:text-8xl">
                  {t("title")}
                  <span className="text-[#CCFF00]">{t("titleAccent")}</span>
                </h1>
                <p className="mt-2 uppercase tracking-wider text-[#888888]">{itemCountLabel}</p>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-6 w-6 fill-[#CCFF00] text-[#CCFF00]" />
                <span className="text-2xl font-bold text-[#CCFF00]">{filteredWishlistProducts.length}</span>
              </div>
            </div>
          </div>

          {isHydrating || isLoading ? (
            <div className="border-4 border-dashed border-[#333333] py-20 text-center">
              <p className="text-xl uppercase tracking-wider text-[#888888]">{t("loading")}</p>
            </div>
          ) : filteredWishlistProducts.length === 0 ? (
            <div className="border-4 border-dashed border-[#333333] py-20 text-center">
              <Heart className="mx-auto mb-6 h-20 w-20 text-[#333333]" />
              <p className="mb-2 text-2xl uppercase tracking-wider text-[#888888]">{t("empty")}</p>
              <p className="mb-8 text-sm uppercase tracking-wider text-[#666666]">{t("emptySubtitle")}</p>
              <Link
                href="/shop"
                className="inline-block border-4 border-[#CCFF00] bg-[#CCFF00] px-8 py-4 text-xl font-bold uppercase tracking-wider text-[#0a0a0a] transition-colors hover:bg-[#0a0a0a] hover:text-[#CCFF00]"
              >
                {t("shopNow")}
              </Link>
            </div>
          ) : (
            <div className="space-y-12">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {filteredWishlistProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group relative border-4 border-[#CCFF00] bg-[#0a0a0a] transition-all hover:-translate-y-1 hover:translate-x-1 hover:shadow-[8px_8px_0px_#CCFF00]"
                  >
                    <button
                      type="button"
                      onClick={() => void removeFromWishlist(product.id)}
                      className="absolute right-3 top-3 z-20 border-2 border-[#ff4444] bg-[#0a0a0a]/80 p-2 text-[#ff4444] transition-all hover:bg-[#ff4444] hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>

                    <div className="absolute left-3 top-3 z-20 border-2 border-[#CCFF00] bg-[#CCFF00] p-2">
                      <Heart className="h-5 w-5 fill-current text-[#0a0a0a]" />
                    </div>

                    <Link href={`/product/${product.id}`}>
                      <div className="relative aspect-square overflow-hidden bg-[#1a1a1a]">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-[#CCFF00] opacity-0 transition-opacity group-hover:opacity-10" />
                      </div>
                    </Link>

                    <div className="border-t-4 border-[#CCFF00] p-4">
                      <p className="mb-1 text-xs font-bold uppercase tracking-wider text-[#CCFF00]">
                        {product.category[locale]}
                      </p>
                      <h3 className="mb-2 truncate text-lg font-bold uppercase tracking-tight text-white">
                        {product.name}
                      </h3>
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-xl font-bold text-[#CCFF00]">{formatPrice(product)}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => void handleAddToBag(product)}
                          disabled={pendingProductId === product.id}
                          className="flex flex-1 items-center justify-center gap-2 bg-[#CCFF00] py-3 text-sm font-bold uppercase tracking-wider text-[#0a0a0a] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          <ShoppingBag className="h-4 w-4" />
                          {pendingProductId === product.id ? t("adding") : t("addToBag")}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <Link
                  href="/shop"
                  className="inline-block text-sm uppercase tracking-wider text-[#888888] transition-colors hover:text-[#CCFF00]"
                >
                  {t("continueShopping")}
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {sizePickerProduct ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            aria-label={t("closeSizePicker")}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={closeSizePicker}
          />
          <div className="relative z-10 w-full max-w-md border-4 border-[#CCFF00] bg-[#0a0a0a] p-6 shadow-[10px_10px_0px_#CCFF00]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#CCFF00]">{t("sizePickerTitle")}</p>
                <h2 className="mt-2 text-2xl font-bold uppercase tracking-tight text-white">
                  {sizePickerProduct.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeSizePicker}
                className="border-2 border-[#CCFF00] p-2 text-[#CCFF00] transition-colors hover:bg-[#CCFF00] hover:text-[#0a0a0a]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-6 flex flex-wrap gap-3">
              {getAvailableSizes(sizePickerProduct).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-14 border-4 px-4 py-3 text-base font-bold uppercase transition-all ${
                    selectedSize === size
                      ? "border-[#CCFF00] bg-[#CCFF00] text-[#0a0a0a]"
                      : "border-[#CCFF00] bg-[#0a0a0a] text-white hover:bg-[#1a1a1a]"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => void handleConfirmSize()}
              disabled={!selectedSize || pendingProductId === sizePickerProduct.id}
              className="w-full border-4 border-[#CCFF00] bg-[#CCFF00] px-6 py-4 text-lg font-bold uppercase tracking-wider text-[#0a0a0a] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {pendingProductId === sizePickerProduct.id ? t("adding") : t("confirmAdd")}
            </button>
          </div>
        </div>
      ) : null}
    </main>
  )
}
