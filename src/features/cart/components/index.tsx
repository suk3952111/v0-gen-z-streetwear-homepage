"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Minus, Plus, Sparkles, X } from "lucide-react"
import { APP_URLS } from "@/constants/url"
import { vibeCategories } from "@/mocks/cart"
import { useI18n } from "@/lib/i18n/use-i18n"
import { NoiseOverlay } from "@/components/ui"
import { useCart } from "@/components/providers/cart-provider"
import { createSupabaseClient } from "@/lib/supabase/client"
import { getProductsBySlugs } from "@/features/products/services/get-products-by-slugs"
import { createCheckoutOrderAction } from "@/features/cart/actions/create-checkout-order"
import type { ShopProductItem } from "@/features/products/types/shop"

type CartItemViewModel = {
  id: string
  productId: string
  name: string
  priceUSD: number
  priceKRW: number
  size: string
  quantity: number
  image: string
  vibeTag: string
}

export function CartView() {
  const { locale, t } = useI18n("cart")
  const router = useRouter()
  const { entries, setQuantity, removeFromCart, isHydrating } = useCart()
  const [productById, setProductById] = useState<Record<string, ShopProductItem>>({})
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const loadProducts = async () => {
      const slugs = [
        ...new Set(
          entries
            .map((entry) => entry.productId)
            .filter((slug): slug is string => typeof slug === "string" && slug.trim().length > 0),
        ),
      ]
      if (slugs.length === 0) {
        if (!isHydrating) {
          setProductById({})
        }
        setIsLoadingProducts(false)
        return
      }

      setIsLoadingProducts(true)
      try {
        const supabase = createSupabaseClient()
        const products = await getProductsBySlugs(supabase, slugs)
        if (cancelled) return
        const map: Record<string, ShopProductItem> = {}
        products.forEach((product) => {
          map[product.id] = product
        })
        setProductById(map)
      } catch {
        // keep previous map on transient failures
      } finally {
        if (!cancelled) {
          setIsLoadingProducts(false)
        }
      }
    }

    void loadProducts()
    return () => {
      cancelled = true
    }
  }, [entries, isHydrating])

  const items = useMemo<CartItemViewModel[]>(() => {
    return entries
      .map((entry) => {
        const product = productById[entry.productId]
        if (!product) return null
        const vibeTag = product.tags[0]?.replace("#", "").toUpperCase() ?? "VIBE"
        return {
          id: entry.key,
          productId: entry.productId,
          name: product.name,
          priceUSD: product.priceUSD,
          priceKRW: product.priceKRW,
          size: entry.size,
          quantity: entry.quantity,
          image: product.image,
          vibeTag,
        }
      })
      .filter((item): item is CartItemViewModel => item !== null)
  }, [entries, productById])

  const updateQuantity = async (id: string, delta: number) => {
    const current = entries.find((entry) => entry.key === id)
    if (!current) return
    const nextQuantity = Math.max(1, current.quantity + delta)
    await setQuantity(id, nextQuantity)
  }

  const removeItem = async (id: string) => {
    await removeFromCart(id)
  }

  const handleCheckout = async () => {
    if (items.length === 0 || isCheckingOut) return

    setIsCheckingOut(true)
    setCheckoutError(null)
    setCheckoutMessage(null)

    const response = await createCheckoutOrderAction({})
    setIsCheckingOut(false)

    if (!response.success || !response.data) {
      const errorMessage = response.errorMessage ?? "Checkout failed"
      if (errorMessage === "Login required") {
        setCheckoutError(t("loginRequiredRedirect"))
        setTimeout(() => {
          router.push(`${APP_URLS.login}?next=${encodeURIComponent(APP_URLS.cart)}`)
        }, 500)
        return
      }
      setCheckoutError(errorMessage)
      return
    }

    for (const entry of entries) {
      await removeFromCart(entry.key)
    }

    setCheckoutMessage(
      locale === "KR"
        ? `주문이 완료되었습니다. 주문번호: ${response.data.orderNumber}`
        : `Checkout complete. Order #: ${response.data.orderNumber}`,
    )
  }

  const formatPrice = (usd: number, krw: number) => {
    if (locale === "KR") return `${Math.round(krw).toLocaleString()}원`
    return `$${Math.round(usd)}`
  }

  const subtotal = items.reduce(
    (acc, item) => acc + (locale === "KR" ? item.priceKRW : item.priceUSD) * item.quantity,
    0,
  )

  const orderNumber = "VC" + Math.random().toString(36).substring(2, 8).toUpperCase()
  const currentDate = new Date().toLocaleDateString(locale === "KR" ? "ko-KR" : "en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <section className="relative pt-24 pb-20 px-4 md:px-8">
        <NoiseOverlay />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="mb-12 border-b-4 border-[#CCFF00] pb-6">
            <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tighter leading-none">
              {t("title")}
              <span className="text-[#CCFF00]">{t("titleAccent")}</span>
            </h1>
          </div>

          {checkoutMessage && (
            <p className="mb-6 text-[#00FF88] text-sm uppercase tracking-wider">{checkoutMessage}</p>
          )}
          {checkoutError && (
            <p className="mb-6 text-[#ff6666] text-sm uppercase tracking-wider">{checkoutError}</p>
          )}

          {(isHydrating || isLoadingProducts) ? (
            <div className="text-center py-20">
              <p className="text-[#888888] text-2xl uppercase tracking-wider mb-8">
                {locale === "KR" ? "장바구니 불러오는 중..." : "Loading cart..."}
              </p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#888888] text-2xl uppercase tracking-wider mb-8">{t("empty")}</p>
              <Link
                href="/shop"
                className="inline-block px-8 py-4 bg-[#CCFF00] text-[#0a0a0a] text-xl font-bold uppercase tracking-wider border-4 border-[#CCFF00] hover:bg-[#0a0a0a] hover:text-[#CCFF00] transition-colors"
              >
                {t("shopNow")}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="border-4 border-[#CCFF00] bg-[#0a0a0a] p-4 md:p-6 flex flex-col md:flex-row gap-6"
                  >
                    <div className="relative w-full md:w-40 h-40 border-2 border-[#CCFF00] flex-shrink-0">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                      <span className="absolute top-2 left-2 px-2 py-1 bg-[#0a0a0a] border border-[#CCFF00] text-[#CCFF00] text-xs font-bold">
                        {item.vibeTag}
                      </span>
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl md:text-2xl font-bold text-white uppercase tracking-tight">
                          {item.name}
                        </h3>
                        <p className="text-[#888888] uppercase text-sm mt-1">SIZE: {item.size}</p>
                      </div>

                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[#888888] text-sm uppercase mr-2">{t("quantity")}</span>
                          <button
                            onClick={() => void updateQuantity(item.id, -1)}
                            className="w-10 h-10 border-2 border-[#CCFF00] text-[#CCFF00] flex items-center justify-center hover:bg-[#CCFF00] hover:text-[#0a0a0a] transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-12 h-10 border-2 border-[#CCFF00] text-white flex items-center justify-center font-bold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => void updateQuantity(item.id, 1)}
                            className="w-10 h-10 border-2 border-[#CCFF00] text-[#CCFF00] flex items-center justify-center hover:bg-[#CCFF00] hover:text-[#0a0a0a] transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-6">
                          <p className="text-[#CCFF00] text-2xl font-bold">
                            {formatPrice(item.priceUSD * item.quantity, item.priceKRW * item.quantity)}
                          </p>
                          <button
                            onClick={() => void removeItem(item.id)}
                            className="flex items-center gap-2 text-[#888888] hover:text-[#ff4444] transition-colors uppercase text-sm"
                            aria-label="Remove item"
                          >
                            <X className="w-5 h-5" />
                            <span className="hidden md:inline">{t("remove")}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="border-4 border-[#CCFF00] bg-[#0a0a0a] p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="w-6 h-6 text-[#CCFF00]" />
                    <h3 className="text-xl font-bold text-[#CCFF00] uppercase tracking-wider">{t("aiAnalyzer")}</h3>
                  </div>
                  <p className="text-[#888888] text-sm uppercase tracking-wider mb-4">{t("vibeScore")}</p>
                  <div className="space-y-4">
                    {vibeCategories.map((vibe) => (
                      <div key={vibe.name}>
                        <div className="flex justify-between mb-2">
                          <span className="text-white font-bold uppercase text-sm">{vibe.name}</span>
                          <span className="text-white font-bold">{vibe.percentage}%</span>
                        </div>
                        <div className="h-3 bg-[#1a1a1a] border border-[#333333]">
                          <div
                            className="h-full transition-all duration-500"
                            style={{
                              width: `${vibe.percentage}%`,
                              backgroundColor: vibe.color,
                              boxShadow: `0 0 10px ${vibe.color}`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="border-4 border-[#CCFF00] bg-[#0a0a0a] sticky top-24">
                  <div className="border-b-4 border-dashed border-[#CCFF00] p-6 text-center">
                    <h2 className="text-3xl font-bold text-[#CCFF00] tracking-tighter">VIBE CHECK</h2>
                    <p className="text-[#888888] text-xs uppercase tracking-[0.3em] mt-2">STREETWEAR RECEIPT</p>
                  </div>

                  <div className="p-6 space-y-4 font-mono text-sm">
                    <div className="flex justify-between text-[#888888]">
                      <span>{t("orderNumber")}</span>
                      <span className="text-white">{orderNumber}</span>
                    </div>
                    <div className="flex justify-between text-[#888888]">
                      <span>{t("date")}</span>
                      <span className="text-white">{currentDate}</span>
                    </div>

                    <div className="border-t border-dashed border-[#333333] my-4" />

                    <div className="space-y-2">
                      <p className="text-[#888888] uppercase">{t("items")}</p>
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between text-white text-xs">
                          <span className="truncate max-w-[60%]">
                            {item.quantity}x {item.name}
                          </span>
                          <span>
                            {formatPrice(item.priceUSD * item.quantity, item.priceKRW * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-dashed border-[#333333] my-4" />

                    <div className="flex justify-between text-[#888888]">
                      <span>{t("subtotal")}</span>
                      <span className="text-white">
                        {locale === "KR" ? `${Math.round(subtotal).toLocaleString()}원` : `$${Math.round(subtotal)}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#888888]">
                      <span>{t("shipping")}</span>
                      <span className="text-white text-xs">{t("shippingValue")}</span>
                    </div>

                    <div className="border-t-4 border-[#CCFF00] my-4" />

                    <div className="flex justify-between text-xl font-bold">
                      <span className="text-white">{t("total")}</span>
                      <span className="text-[#CCFF00]">
                        {locale === "KR" ? `${Math.round(subtotal).toLocaleString()}원` : `$${Math.round(subtotal)}`}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 pt-0 space-y-4">
                    <button
                      onClick={() => void handleCheckout()}
                      disabled={isCheckingOut || items.length === 0}
                      className="w-full py-4 bg-[#CCFF00] text-[#0a0a0a] text-xl font-bold uppercase tracking-wider border-4 border-[#CCFF00] hover:bg-[#0a0a0a] hover:text-[#CCFF00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCheckingOut ? "PROCESSING..." : t("checkout")}
                    </button>
                    <Link
                      href="/shop"
                      className="block text-center text-[#888888] text-sm uppercase tracking-wider hover:text-[#CCFF00] transition-colors"
                    >
                      {t("continueShop")}
                    </Link>
                    <Link
                      href="/account"
                      className="block text-center text-[#888888] text-sm uppercase tracking-wider hover:text-[#CCFF00] transition-colors"
                    >
                      VIEW ORDERS
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
