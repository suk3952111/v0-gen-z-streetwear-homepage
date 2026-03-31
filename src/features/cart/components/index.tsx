"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import Script from "next/script"
import { useRouter } from "next/navigation"
import { Minus, Plus, Sparkles, X } from "lucide-react"
import { APP_URLS } from "@/constants/url"
import { vibeCategories } from "@/mocks/cart"
import { useI18n } from "@/lib/i18n/use-i18n"
import { formatProductPriceByLocale } from "@/lib/format/currency"
import { formatDateByLocale } from "@/lib/format/date"
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

type TossPaymentRequest = {
  amount: {
    currency: "KRW"
    value: number
  }
  card?: {
    flowMode?: "DEFAULT" | "DIRECT"
  }
  customerEmail?: string
  customerName?: string
  failUrl: string
  method: "CARD"
  orderId: string
  orderName: string
  successUrl: string
}

type TossPaymentInstance = {
  requestPayment: (request: TossPaymentRequest) => Promise<void>
}

declare global {
  interface Window {
    TossPayments?: (clientKey: string) => {
      payment: (params: { customerKey: string }) => TossPaymentInstance
    }
  }
}

export function CartView() {
  const { locale, t } = useI18n("cart")
  const router = useRouter()
  const { entries, setQuantity, removeFromCart, isHydrating } = useCart()
  const [productById, setProductById] = useState<Record<string, ShopProductItem>>({})
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [isTossReady, setIsTossReady] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && typeof window.TossPayments === "function") {
      setIsTossReady(true)
    }
  }, [])

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
        // Keep the current UI state on transient product fetch failures.
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

        return {
          id: entry.key,
          productId: entry.productId,
          name: product.name,
          priceUSD: product.priceUSD,
          priceKRW: product.priceKRW,
          size: entry.size,
          quantity: entry.quantity,
          image: product.image,
          vibeTag: product.tags[0]?.replace("#", "").toUpperCase() ?? "VIBE",
        }
      })
      .filter((item): item is CartItemViewModel => item !== null)
  }, [entries, productById])

  const updateQuantity = async (id: string, delta: number) => {
    const current = entries.find((entry) => entry.key === id)
    if (!current) return

    await setQuantity(id, Math.max(1, current.quantity + delta))
  }

  const handleCheckout = async () => {
    if (items.length === 0 || isCheckingOut) return

    const tossClientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY
    if (!tossClientKey) {
      setCheckoutError(t("paymentConfigMissing"))
      return
    }

    if (typeof window.TossPayments !== "function") {
      setCheckoutError(t("paymentSdkLoading"))
      return
    }

    setIsCheckingOut(true)
    setCheckoutError(null)
    setCheckoutMessage(null)

    const response = await createCheckoutOrderAction({})
    if (!response.success || !response.data) {
      setIsCheckingOut(false)

      const errorMessage = response.errorMessage ?? "Checkout failed"
      if (errorMessage === "Login required") {
        setCheckoutError(t("loginRequiredRedirect"))
        setTimeout(() => {
          router.push(`${APP_URLS.login}?next=${encodeURIComponent(APP_URLS.cart)}`)
        }, 500)
        return
      }

      if (errorMessage === "Address required") {
        setCheckoutError(t("addressRequiredRedirect"))
        setTimeout(() => {
          router.push(`${APP_URLS.account}?tab=addresses&add=1`)
        }, 500)
        return
      }

      setCheckoutError(errorMessage)
      return
    }

    try {
      const payment = window.TossPayments(tossClientKey).payment({
        customerKey: response.data.customerKey,
      })

      await payment.requestPayment({
        method: "CARD",
        amount: {
          currency: "KRW",
          value: Math.round(response.data.totalAmount),
        },
        orderId: response.data.orderNumber,
        orderName: response.data.orderName,
        customerEmail: response.data.customerEmail ?? undefined,
        customerName: response.data.customerName ?? undefined,
        successUrl: `${window.location.origin}${APP_URLS.cartSuccess}`,
        failUrl: `${window.location.origin}${APP_URLS.cartFail}`,
        card: {
          flowMode: "DEFAULT",
        },
      })
    } catch (error) {
      const message = error instanceof Error && error.message
        ? error.message
        : t("paymentLaunchFailed")
      setCheckoutError(message)
      setIsCheckingOut(false)
    }
  }

  const subtotal = items.reduce(
    (acc, item) => acc + (locale === "KR" ? item.priceKRW : item.priceUSD) * item.quantity,
    0,
  )

  const orderNumber = `VC${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  const currentDate = formatDateByLocale(new Date(), locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Script
        src="https://js.tosspayments.com/v2/standard"
        strategy="afterInteractive"
        onLoad={() => setIsTossReady(true)}
      />

      <section className="relative px-4 pb-20 pt-24 md:px-8">
        <NoiseOverlay />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mb-12 border-b-4 border-[#CCFF00] pb-6">
            <h1 className="text-6xl font-bold leading-none tracking-tighter text-white md:text-8xl">
              {t("title")}
              <span className="text-[#CCFF00]">{t("titleAccent")}</span>
            </h1>
          </div>

          {checkoutMessage && (
            <p className="mb-6 text-sm uppercase tracking-wider text-[#00FF88]">{checkoutMessage}</p>
          )}
          {checkoutError && (
            <p className="mb-6 text-sm uppercase tracking-wider text-[#ff6666]">{checkoutError}</p>
          )}

          {isHydrating || isLoadingProducts ? (
            <div className="py-20 text-center">
              <p className="mb-8 text-2xl uppercase tracking-wider text-[#888888]">{t("loadingCart")}</p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-20 text-center">
              <p className="mb-8 text-2xl uppercase tracking-wider text-[#888888]">{t("empty")}</p>
              <Link
                href={APP_URLS.shop}
                className="inline-block border-4 border-[#CCFF00] bg-[#CCFF00] px-8 py-4 text-xl font-bold uppercase tracking-wider text-[#0a0a0a] transition-colors hover:bg-[#0a0a0a] hover:text-[#CCFF00]"
              >
                {t("shopNow")}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-6 border-4 border-[#CCFF00] bg-[#0a0a0a] p-4 md:flex-row md:p-6"
                  >
                    <div className="relative h-40 w-full flex-shrink-0 border-2 border-[#CCFF00] md:w-40">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                      <span className="absolute left-2 top-2 border border-[#CCFF00] bg-[#0a0a0a] px-2 py-1 text-xs font-bold text-[#CCFF00]">
                        {item.vibeTag}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-bold uppercase tracking-tight text-white md:text-2xl">
                          {item.name}
                        </h3>
                        <p className="mt-1 text-sm uppercase text-[#888888]">SIZE: {item.size}</p>
                      </div>

                      <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-2">
                          <span className="mr-2 text-sm uppercase text-[#888888]">{t("quantity")}</span>
                          <button
                            onClick={() => void updateQuantity(item.id, -1)}
                            className="flex h-10 w-10 items-center justify-center border-2 border-[#CCFF00] text-[#CCFF00] transition-colors hover:bg-[#CCFF00] hover:text-[#0a0a0a]"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="flex h-10 w-12 items-center justify-center border-2 border-[#CCFF00] font-bold text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => void updateQuantity(item.id, 1)}
                            className="flex h-10 w-10 items-center justify-center border-2 border-[#CCFF00] text-[#CCFF00] transition-colors hover:bg-[#CCFF00] hover:text-[#0a0a0a]"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-6 md:justify-end">
                          <p className="text-2xl font-bold text-[#CCFF00]">
                            {formatProductPriceByLocale({
                              locale,
                              usd: item.priceUSD * item.quantity,
                              krw: item.priceKRW * item.quantity,
                            })}
                          </p>
                          <button
                            onClick={() => void removeFromCart(item.id)}
                            className="flex items-center gap-2 text-sm uppercase text-[#888888] transition-colors hover:text-[#ff4444]"
                            aria-label="Remove item"
                          >
                            <X className="h-5 w-5" />
                            <span className="hidden md:inline">{t("remove")}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="border-4 border-[#CCFF00] bg-[#0a0a0a] p-6">
                  <div className="mb-6 flex items-center gap-3">
                    <Sparkles className="h-6 w-6 text-[#CCFF00]" />
                    <h3 className="text-xl font-bold uppercase tracking-wider text-[#CCFF00]">{t("aiAnalyzer")}</h3>
                  </div>
                  <p className="mb-4 text-sm uppercase tracking-wider text-[#888888]">{t("vibeScore")}</p>
                  <div className="space-y-4">
                    {vibeCategories.map((vibe) => (
                      <div key={vibe.name}>
                        <div className="mb-2 flex justify-between">
                          <span className="text-sm font-bold uppercase text-white">{vibe.name}</span>
                          <span className="font-bold text-white">{vibe.percentage}%</span>
                        </div>
                        <div className="h-3 border border-[#333333] bg-[#1a1a1a]">
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
                <div className="sticky top-24 border-4 border-[#CCFF00] bg-[#0a0a0a]">
                  <div className="border-b-4 border-dashed border-[#CCFF00] p-6 text-center">
                    <h2 className="text-3xl font-bold tracking-tighter text-[#CCFF00]">VIBE CHECK</h2>
                    <p className="mt-2 text-xs uppercase tracking-[0.3em] text-[#888888]">STREETWEAR RECEIPT</p>
                  </div>

                  <div className="space-y-4 p-6 font-mono text-sm">
                    <div className="flex justify-between text-[#888888]">
                      <span>{t("orderNumber")}</span>
                      <span className="text-white">{orderNumber}</span>
                    </div>
                    <div className="flex justify-between text-[#888888]">
                      <span>{t("date")}</span>
                      <span className="text-white">{currentDate}</span>
                    </div>

                    <div className="my-4 border-t border-dashed border-[#333333]" />

                    <div className="space-y-2">
                      <p className="uppercase text-[#888888]">{t("items")}</p>
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between text-xs text-white">
                          <span className="max-w-[60%] truncate">
                            {item.quantity}x {item.name}
                          </span>
                          <span>
                            {formatProductPriceByLocale({
                              locale,
                              usd: item.priceUSD * item.quantity,
                              krw: item.priceKRW * item.quantity,
                            })}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="my-4 border-t border-dashed border-[#333333]" />

                    <div className="flex justify-between text-[#888888]">
                      <span>{t("subtotal")}</span>
                      <span className="text-white">
                        {formatProductPriceByLocale({ locale, usd: subtotal, krw: subtotal })}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#888888]">
                      <span>{t("shipping")}</span>
                      <span className="text-xs text-white">{t("shippingValue")}</span>
                    </div>

                    <div className="my-4 border-t-4 border-[#CCFF00]" />

                    <div className="flex justify-between text-xl font-bold">
                      <span className="text-white">{t("total")}</span>
                      <span className="text-[#CCFF00]">
                        {formatProductPriceByLocale({ locale, usd: subtotal, krw: subtotal })}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4 p-6 pt-0">
                    <button
                      onClick={() => void handleCheckout()}
                      disabled={isCheckingOut || items.length === 0 || !isTossReady}
                      className="w-full border-4 border-[#CCFF00] bg-[#CCFF00] py-4 text-xl font-bold uppercase tracking-wider text-[#0a0a0a] transition-colors hover:bg-[#0a0a0a] hover:text-[#CCFF00] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isCheckingOut ? t("paymentPreparing") : t("checkout")}
                    </button>
                    <Link
                      href={APP_URLS.shop}
                      className="block text-center text-sm uppercase tracking-wider text-[#888888] transition-colors hover:text-[#CCFF00]"
                    >
                      {t("continueShop")}
                    </Link>
                    <Link
                      href={APP_URLS.account}
                      className="block text-center text-sm uppercase tracking-wider text-[#888888] transition-colors hover:text-[#CCFF00]"
                    >
                      {t("viewOrders")}
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
