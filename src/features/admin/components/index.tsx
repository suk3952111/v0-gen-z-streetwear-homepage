"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Activity,
  AlertTriangle,
  Clock,
  LayoutDashboard,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react"
import { useI18n } from "@/lib/i18n/use-i18n"
import { loadAdminDashboardAction } from "@/features/admin/actions/load-dashboard"
import type { AdminDashboardPayload } from "@/features/admin/actions/load-dashboard/types"
import {
  createAdminProductAction,
  deleteAdminProductAction,
  updateAdminVariantStockAction,
} from "@/features/admin/actions/manage-catalog"
import { formatStoredKrwAmountByLocale } from "@/lib/format/currency"
import { formatDateByLocale } from "@/lib/format/date"

type Tab = "dashboard" | "products" | "orders" | "inventory" | "activity"

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex min-h-[180px] items-center justify-center border-2 border-dashed border-[#333333] px-6 text-center text-sm font-bold uppercase tracking-[0.25em] text-[#666666]">
      {label}
    </div>
  )
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse bg-[#1a1a1a] ${className}`} />
}

export function AdminView() {
  const { locale, t } = useI18n("admin")
  const [activeTab, setActiveTab] = useState<Tab>("products")
  const [isLoading, setIsLoading] = useState(true)
  const [isMutating, setIsMutating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [payload, setPayload] = useState<AdminDashboardPayload | null>(null)
  const [page, setPage] = useState(1)
  const [productQuery, setProductQuery] = useState("")
  const [orderQuery, setOrderQuery] = useState("")
  const [activityQuery, setActivityQuery] = useState("")
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [stockDeltaByVariant, setStockDeltaByVariant] = useState<Record<string, number>>({})
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [productForm, setProductForm] = useState({
    name: "",
    slug: "",
    description: "",
    basePrice: 0,
    categoryId: "",
    brandId: "",
    initialSize: "M",
    initialStock: 0,
    isPublished: true,
    isFeatured: false,
  })
  const pageSize = 10

  const navItems = useMemo(
    () => [
      { id: "dashboard" as Tab, icon: LayoutDashboard, label: t("tabs.dashboard") },
      { id: "products" as Tab, icon: Package, label: t("tabs.products") },
      { id: "orders" as Tab, icon: ShoppingCart, label: t("tabs.orders") },
      { id: "inventory" as Tab, icon: AlertTriangle, label: t("tabs.inventory") },
      { id: "activity" as Tab, icon: Activity, label: t("tabs.activity") },
    ],
    [t],
  )

  const loadDashboard = async (nextPage: number) => {
    setIsLoading(true)
    setErrorMessage(null)
    const response = await loadAdminDashboardAction({ page: nextPage, pageSize })

    if (!response.success || !response.data) {
      setPayload(null)
      setErrorMessage(response.errorMessage ?? "Failed to load admin dashboard")
      setIsLoading(false)
      return
    }

    setPayload(response.data)
    setPage(response.data.page)
    setIsLoading(false)
  }

  useEffect(() => {
    void loadDashboard(1)
  }, [])

  useEffect(() => {
    if (payload?.categories.length && !productForm.categoryId) {
      setProductForm((prev) => ({ ...prev, categoryId: payload.categories[0].id }))
    }
  }, [payload, productForm.categoryId])

  const runMutation = async (task: () => Promise<{ success: boolean; errorMessage?: string }>) => {
    setIsMutating(true)
    setErrorMessage(null)
    const result = await task()

    if (!result.success) {
      setErrorMessage(result.errorMessage ?? t("actions.failed"))
      setIsMutating(false)
      return
    }

    await loadDashboard(page)
    setIsMutating(false)
  }

  const statusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-[#00FF88] text-[#0a0a0a]"
      case "shipped":
        return "bg-[#00CCFF] text-[#0a0a0a]"
      case "confirmed":
      case "pending":
        return "bg-[#FFCC00] text-[#0a0a0a]"
      case "cancelled":
        return "bg-[#FF4444] text-white"
      default:
        return "bg-[#333333] text-white"
    }
  }

  const getStockColor = (quantity: number) => {
    if (quantity <= 2) return "text-[#FF4444]"
    if (quantity <= 10) return "text-[#FFCC00]"
    return "text-[#00FF88]"
  }

  const filteredProducts = useMemo(() => {
    const items = payload?.products ?? []
    const query = productQuery.trim().toLowerCase()
    if (!query) return items
    return items.filter((product) =>
      [product.name, product.slug, product.brand, product.category].some((value) =>
        value.toLowerCase().includes(query),
      ),
    )
  }, [payload?.products, productQuery])

  const filteredOrders = useMemo(() => {
    const items = payload?.orders ?? []
    const query = orderQuery.trim().toLowerCase()
    if (!query) return items
    return items.filter((order) =>
      [order.orderNumber, order.customer, order.status].some((value) =>
        value.toLowerCase().includes(query),
      ),
    )
  }, [payload?.orders, orderQuery])

  const filteredActivities = useMemo(() => {
    const items = payload?.activities ?? []
    const query = activityQuery.trim().toLowerCase()
    if (!query) return items
    return items.filter((log) =>
      [log.actor, log.actionType, log.targetTable, log.description ?? ""].some((value) =>
        value.toLowerCase().includes(query),
      ),
    )
  }, [payload?.activities, activityQuery])

  const totalPages = payload?.totalPages ?? 1
  const canPrev = page > 1
  const canNext = page < totalPages

  const closeProductModal = () => {
    setIsProductModalOpen(false)
    setProductForm((prev) => ({
      ...prev,
      name: "",
      slug: "",
      description: "",
      basePrice: 0,
      brandId: "",
      initialSize: "M",
      initialStock: 0,
      isPublished: true,
      isFeatured: false,
    }))
  }

  const handleCreateProduct = async () => {
    await runMutation(async () =>
      createAdminProductAction({
        name: productForm.name,
        slug: productForm.slug,
        description: productForm.description,
        basePrice: Number(productForm.basePrice),
        categoryId: productForm.categoryId,
        brandId: productForm.brandId || null,
        initialSize: productForm.initialSize,
        initialStock: Number(productForm.initialStock),
        isPublished: productForm.isPublished,
        isFeatured: productForm.isFeatured,
      }),
    )
    closeProductModal()
  }

  const handleDeleteProduct = async (productId: string) => {
    await runMutation(async () => deleteAdminProductAction({ productId }))
    setDeleteConfirmId(null)
  }

  const handleAdjustStock = async (variantId: string, delta: number) => {
    await runMutation(async () => updateAdminVariantStockAction({ variantId, delta }))
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="fixed left-0 right-0 top-0 z-40 border-b-4 border-[#CCFF00] bg-[#0a0a0a]">
        <div className="flex items-center justify-between px-4 py-4 md:px-8">
          <h1 className="text-2xl font-bold tracking-tighter text-[#CCFF00] md:text-3xl">
            VIBE CHECK <span className="text-white">{t("title")}</span>
          </h1>
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 border-2 border-[#333333] px-4 py-2 md:flex">
              <div className="h-3 w-3 animate-pulse rounded-full bg-[#00FF88]" />
              <span className="text-sm font-bold uppercase tracking-wider text-[#888888]">{t("common.adminOnline")}</span>
            </div>
            <button
              onClick={() => void loadDashboard(page)}
              disabled={isLoading || isMutating}
              className="border-2 border-[#CCFF00] p-2 text-[#CCFF00] transition-colors hover:bg-[#CCFF00] hover:text-[#0a0a0a] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={t("refresh")}
            >
              <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex pt-[72px]">
        <aside className="fixed bottom-0 left-0 top-[72px] hidden w-64 flex-col border-r-4 border-[#CCFF00] bg-[#0a0a0a] lg:flex">
          <div className="border-b-2 border-[#1a1a1a] p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border-4 border-[#CCFF00]">
                <Package className="h-5 w-5 text-[#CCFF00]" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-white">{t("common.controlPanel")}</p>
                <p className="text-xs uppercase tracking-wider text-[#888888]">{t("common.version")}</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-4">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold uppercase tracking-wider transition-all ${
                      isActive
                        ? "bg-[#CCFF00] text-[#0a0a0a] shadow-[0_0_15px_rgba(204,255,0,0.3)]"
                        : "border-2 border-transparent text-white hover:border-[#CCFF00] hover:text-[#CCFF00]"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    [{item.label}]
                  </button>
                )
              })}
            </div>
          </nav>
          <div className="border-t-4 border-[#333333] p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#888888]">{t("stats.pending")}</span>
                <span className="text-lg font-bold text-[#FFCC00]">{payload?.stats.pending ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#888888]">{t("stats.lowStock")}</span>
                <span className="text-lg font-bold text-[#FF4444]">{payload?.stats.lowStock ?? 0}</span>
              </div>
            </div>
          </div>
        </aside>

        <div className="fixed bottom-0 left-0 right-0 z-40 border-t-4 border-[#CCFF00] bg-[#0a0a0a] lg:hidden">
          <div className="flex justify-around p-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`p-3 transition-colors ${activeTab === item.id ? "text-[#CCFF00]" : "text-[#888888] hover:text-white"}`}
                  aria-label={item.label}
                >
                  <Icon className="h-6 w-6" />
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex-1 p-4 pb-24 md:p-8 lg:ml-64 lg:pb-8">
          {errorMessage && <div className="mb-6 border-2 border-[#FF4444] bg-[#FF4444]/10 px-4 py-3 text-sm font-bold uppercase tracking-wider text-[#FF6666]">{errorMessage}</div>}

          {activeTab === "dashboard" && (
            <div className="space-y-8">
              <h2 className="text-4xl font-bold uppercase tracking-tighter text-white md:text-5xl">{t("tabs.dashboard")}</h2>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {isLoading ? (
                  <>
                    <SkeletonBlock className="h-[132px] w-full border-4 border-[#333333]" />
                    <SkeletonBlock className="h-[132px] w-full border-4 border-[#333333]" />
                    <SkeletonBlock className="h-[132px] w-full border-4 border-[#333333]" />
                    <SkeletonBlock className="h-[132px] w-full border-4 border-[#333333]" />
                  </>
                ) : (
                  <>
                    <article className="border-4 border-[#CCFF00] p-6"><Activity className="mb-4 h-8 w-8 text-[#00FF88]" /><p className="mb-1 text-xs font-bold uppercase tracking-[0.3em] text-[#888888]">{t("stats.sales")}</p><p className="text-3xl font-bold text-white">{formatStoredKrwAmountByLocale({ locale, amountKrw: payload?.stats.sales ?? 0 })}</p></article>
                    <article className="border-4 border-[#CCFF00] p-6"><ShoppingCart className="mb-4 h-8 w-8 text-[#CCFF00]" /><p className="mb-1 text-xs font-bold uppercase tracking-[0.3em] text-[#888888]">{t("stats.orders")}</p><p className="text-3xl font-bold text-white">{payload?.stats.orders ?? 0}</p></article>
                    <article className="border-4 border-[#FFCC00] p-6"><Clock className="mb-4 h-8 w-8 text-[#FFCC00]" /><p className="mb-1 text-xs font-bold uppercase tracking-[0.3em] text-[#888888]">{t("stats.pending")}</p><p className="text-3xl font-bold text-[#FFCC00]">{payload?.stats.pending ?? 0}</p></article>
                    <article className="border-4 border-[#FF4444] p-6"><AlertTriangle className="mb-4 h-8 w-8 text-[#FF4444]" /><p className="mb-1 text-xs font-bold uppercase tracking-[0.3em] text-[#888888]">{t("stats.lowStock")}</p><p className="text-3xl font-bold text-[#FF4444]">{payload?.stats.lowStock ?? 0}</p></article>
                  </>
                )}
              </div>
              <div className="border-4 border-[#CCFF00] p-6">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <h3 className="text-xl font-bold uppercase tracking-wider text-white">{t("orderTable.title")}</h3>
                  <button onClick={() => setActiveTab("orders")} className="text-sm font-bold uppercase tracking-wider text-[#CCFF00] hover:underline">{t("common.viewAll")}</button>
                </div>
                {isLoading ? (
                  <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <SkeletonBlock key={i} className="h-[74px] w-full border-2 border-[#222222]" />)}</div>
                ) : (payload?.orders.length ?? 0) === 0 ? (
                  <EmptyState label={t("empty.orders")} />
                ) : (
                  <div className="space-y-3">
                    {(payload?.orders ?? []).slice(0, 3).map((order) => (
                      <div key={order.id} className="flex items-center justify-between gap-4 border-2 border-[#222222] bg-[#111111] p-4 transition-colors hover:border-[#CCFF00]">
                        <div><p className="font-bold tracking-wider text-white">{order.orderNumber}</p><p className="text-sm text-[#888888]">{order.customer}</p></div>
                        <div className="text-right"><span className={`inline-block px-3 py-1 text-xs font-bold uppercase ${statusColor(order.status)}`}>{t(`statuses.${order.status}`)}</span><p className="mt-1 font-bold text-[#CCFF00]">{formatStoredKrwAmountByLocale({ locale, amountKrw: order.total })}</p></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "products" && (
            <div className="space-y-6">
              <h2 className="text-4xl font-bold uppercase tracking-tighter text-white md:text-5xl">{t("productsTable.title")}</h2>
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-[#CCFF00]" />
                  <input
                    type="text"
                    placeholder={t("productsTable.name")}
                    value={productQuery}
                    onChange={(e) => setProductQuery(e.target.value)}
                    className="w-full border-4 border-[#CCFF00] bg-[#0a0a0a] py-4 pl-14 pr-12 text-base font-mono tracking-wider text-white placeholder:text-[#888888] focus:outline-none focus:shadow-[0_0_20px_#CCFF00]"
                  />
                  {productQuery && (
                    <button onClick={() => setProductQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#CCFF00] hover:text-white">
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setIsProductModalOpen(true)}
                  className="flex items-center gap-3 whitespace-nowrap border-4 border-[#CCFF00] bg-[#CCFF00] px-8 py-4 font-bold uppercase tracking-wider text-[#0a0a0a] transition-all hover:bg-[#0a0a0a] hover:text-[#CCFF00] hover:shadow-[0_0_20px_#CCFF00]"
                >
                  <Plus className="h-6 w-6" />
                  {t("actions.createProduct")}
                </button>
              </div>
              <p className="text-sm font-bold uppercase tracking-wider text-[#888888]">{t("productsTable.showing", { current: filteredProducts.length, total: payload?.products.length ?? 0 })}</p>
              <div className="overflow-x-auto border-4 border-[#CCFF00]">
                {isLoading ? (
                  <div className="p-6"><SkeletonBlock className="h-[360px] w-full" /></div>
                ) : filteredProducts.length === 0 ? (
                  <div className="p-6"><EmptyState label={t("empty.products")} /></div>
                ) : (
                  <table className="w-full min-w-[980px]">
                    <thead>
                      <tr className="border-b-4 border-[#CCFF00]">
                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.3em] text-[#CCFF00]">{t("productsTable.id")}</th>
                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.3em] text-[#CCFF00]">{t("productsTable.name")}</th>
                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.3em] text-[#CCFF00]">{t("productsTable.category")}</th>
                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.3em] text-[#CCFF00]">{t("productsTable.price")}</th>
                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.3em] text-[#CCFF00]">{t("productsTable.publish")}</th>
                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.3em] text-[#CCFF00]">{t("productsTable.featured")}</th>
                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.3em] text-[#CCFF00]">{t("productsTable.updatedAt")}</th>
                        <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-[0.3em] text-[#CCFF00]">{t("actions.manage")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="group border-t-2 border-[#1a1a1a] bg-[#0a0a0a] transition-all hover:bg-[#111111] hover:shadow-[inset_0_0_30px_rgba(204,255,0,0.05)]">
                          <td className="px-4 py-4 font-mono text-xs text-[#888888]">{product.id}</td>
                          <td className="px-4 py-4"><p className="font-bold uppercase tracking-wider text-white">{product.name}</p><p className="mt-1 font-mono text-xs text-[#888888]">/{product.slug}</p></td>
                          <td className="px-4 py-4"><span className="border-2 border-[#333333] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#888888] group-hover:border-[#CCFF00] group-hover:text-[#CCFF00]">{product.category}</span></td>
                          <td className="px-4 py-4 text-lg font-bold text-[#CCFF00]">{formatStoredKrwAmountByLocale({ locale, amountKrw: product.basePrice })}</td>
                          <td className="px-4 py-4"><span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider ${product.isPublished ? "border-2 border-[#CCFF00] text-[#CCFF00]" : "border-2 border-[#888888] text-[#888888]"}`}>{product.isPublished ? t("common.yes") : t("common.no")}</span></td>
                          <td className="px-4 py-4"><span className={product.isFeatured ? "text-[#00FF88]" : "text-[#888888]"}>{product.isFeatured ? t("common.yes") : t("common.no")}</span></td>
                          <td className="px-4 py-4 text-sm text-[#888888]">{formatDateByLocale(product.updatedAt, locale, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setDeleteConfirmId(deleteConfirmId === product.id ? null : product.id)}
                                className={`p-2 border-2 transition-all ${deleteConfirmId === product.id ? "border-[#FF4444] bg-[#FF4444]/10 text-[#FF4444] shadow-[0_0_15px_rgba(255,68,68,0.4)]" : "border-[#333333] text-[#888888] hover:border-[#FF4444] hover:text-[#FF4444]"}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            {deleteConfirmId === product.id && (
                              <div className="mt-2 flex items-center justify-end gap-2">
                                <button onClick={() => setDeleteConfirmId(null)} className="border-2 border-[#333333] px-3 py-1 text-xs font-bold uppercase text-[#888888] hover:border-white hover:text-white">{t("common.cancel")}</button>
                                <button onClick={() => void handleDeleteProduct(product.id)} disabled={isMutating} className="border-2 border-[#FF4444] bg-[#FF4444] px-3 py-1 text-xs font-bold uppercase text-white hover:bg-[#FF6666] disabled:opacity-50">{t("actions.delete")}</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="space-y-6">
              <h2 className="text-4xl font-bold uppercase tracking-tighter text-white md:text-5xl">{t("orderTable.title")}</h2>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-[#CCFF00]" />
                <input
                  type="text"
                  placeholder={t("orderTable.orderNumber")}
                  value={orderQuery}
                  onChange={(e) => setOrderQuery(e.target.value)}
                  className="w-full border-4 border-[#CCFF00] bg-[#0a0a0a] py-4 pl-14 pr-4 text-base font-mono tracking-wider text-white placeholder:text-[#888888] focus:outline-none focus:shadow-[0_0_20px_#CCFF00]"
                />
              </div>
              <div className="overflow-x-auto border-4 border-[#CCFF00]">
                {isLoading ? (
                  <div className="p-6"><SkeletonBlock className="h-[360px] w-full" /></div>
                ) : filteredOrders.length === 0 ? (
                  <div className="p-6"><EmptyState label={t("empty.orders")} /></div>
                ) : (
                  <table className="w-full min-w-[760px]">
                    <thead>
                      <tr className="border-b-4 border-[#CCFF00]">
                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.3em] text-[#CCFF00]">{t("orderTable.orderNumber")}</th>
                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.3em] text-[#CCFF00]">{t("orderTable.customer")}</th>
                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.3em] text-[#CCFF00]">{t("orderTable.status")}</th>
                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.3em] text-[#CCFF00]">{t("productsTable.updatedAt")}</th>
                        <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-[0.3em] text-[#CCFF00]">{t("orderTable.total")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="border-t-2 border-[#1a1a1a] bg-[#0a0a0a] transition-all hover:bg-[#111111]">
                          <td className="px-4 py-4 font-bold tracking-wider text-white">{order.orderNumber}</td>
                          <td className="px-4 py-4 text-white">{order.customer}</td>
                          <td className="px-4 py-4"><span className={`inline-block px-3 py-1 text-xs font-bold uppercase ${statusColor(order.status)}`}>{t(`statuses.${order.status}`)}</span></td>
                          <td className="px-4 py-4 text-sm text-[#888888]">{order.createdAt ? formatDateByLocale(order.createdAt, locale, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "-"}</td>
                          <td className="px-4 py-4 text-right text-lg font-bold text-[#CCFF00]">{formatStoredKrwAmountByLocale({ locale, amountKrw: order.total })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              <div className="flex items-center justify-end gap-2">
                <button onClick={() => void loadDashboard(page - 1)} disabled={!canPrev || isLoading || isMutating} className="border-2 border-[#333333] px-3 py-1 text-xs font-bold uppercase text-[#888888] hover:border-[#CCFF00] hover:text-[#CCFF00] disabled:opacity-40">{t("common.prev")}</button>
                <span className="text-xs uppercase text-[#888888]">{page} / {totalPages}</span>
                <button onClick={() => void loadDashboard(page + 1)} disabled={!canNext || isLoading || isMutating} className="border-2 border-[#333333] px-3 py-1 text-xs font-bold uppercase text-[#888888] hover:border-[#CCFF00] hover:text-[#CCFF00] disabled:opacity-40">{t("common.next")}</button>
              </div>
            </div>
          )}

          {activeTab === "inventory" && (
            <div className="space-y-6">
              <h2 className="text-4xl font-bold uppercase tracking-tighter text-white md:text-5xl">{t("inventoryTable.title")}</h2>
              <div className="overflow-x-auto border-4 border-[#CCFF00]">
                {isLoading ? (
                  <div className="p-6"><SkeletonBlock className="h-[360px] w-full" /></div>
                ) : (payload?.lowStockItems.length ?? 0) === 0 ? (
                  <div className="p-6"><EmptyState label={t("empty.inventory")} /></div>
                ) : (
                  <table className="w-full min-w-[980px]">
                    <thead>
                      <tr className="border-b-4 border-[#CCFF00]">
                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.3em] text-[#CCFF00]">{t("inventoryTable.product")}</th>
                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.3em] text-[#CCFF00]">{t("inventoryTable.size")}</th>
                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.3em] text-[#CCFF00]">{t("inventoryTable.stock")}</th>
                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.3em] text-[#CCFF00]">{t("inventoryTable.active")}</th>
                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.3em] text-[#CCFF00]">{t("inventoryTable.updatedAt")}</th>
                        <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-[0.3em] text-[#CCFF00]">{t("actions.manage")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(payload?.lowStockItems ?? []).map((item) => (
                        <tr key={item.id} className="border-t-2 border-[#1a1a1a] bg-[#0a0a0a] transition-all hover:bg-[#111111]">
                          <td className="px-4 py-4"><div className="font-bold text-white">{item.productName}</div><div className="text-xs text-[#888888]">/{item.productSlug}</div></td>
                          <td className="px-4 py-4 text-white">{item.size}</td>
                          <td className={`px-4 py-4 text-lg font-bold ${getStockColor(item.stockQuantity)}`}>{item.stockQuantity}</td>
                          <td className="px-4 py-4"><span className={item.isActive ? "text-[#00FF88]" : "text-[#888888]"}>{item.isActive ? t("common.yes") : t("common.no")}</span></td>
                          <td className="px-4 py-4 text-sm text-[#888888]">{formatDateByLocale(item.updatedAt, locale, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap items-center justify-end gap-2">
                              {[1, 5, 10].map((value) => (
                                <button key={value} onClick={() => void handleAdjustStock(item.id, value)} disabled={isMutating} className="border-2 border-[#CCFF00] px-2 py-1 text-xs font-bold uppercase text-[#CCFF00] hover:bg-[#CCFF00] hover:text-[#0a0a0a] disabled:opacity-50">+{value}</button>
                              ))}
                              <input type="number" value={stockDeltaByVariant[item.id] ?? 0} onChange={(e) => setStockDeltaByVariant((prev) => ({ ...prev, [item.id]: Number(e.target.value) }))} className="w-20 border-2 border-[#333333] bg-[#0a0a0a] px-2 py-1 text-white focus:border-[#CCFF00] focus:outline-none" />
                              <button onClick={() => void handleAdjustStock(item.id, Number(stockDeltaByVariant[item.id] ?? 0))} disabled={isMutating || Number(stockDeltaByVariant[item.id] ?? 0) === 0} className="border-2 border-[#00CCFF] px-2 py-1 text-xs font-bold uppercase text-[#00CCFF] hover:bg-[#00CCFF] hover:text-[#0a0a0a] disabled:opacity-50">{t("actions.applyDelta")}</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeTab === "activity" && (
            <div className="space-y-6">
              <h2 className="text-4xl font-bold uppercase tracking-tighter text-white md:text-5xl">{t("activityTable.title")}</h2>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-[#CCFF00]" />
                <input type="text" placeholder={t("activityTable.actor")} value={activityQuery} onChange={(e) => setActivityQuery(e.target.value)} className="w-full border-4 border-[#CCFF00] bg-[#0a0a0a] py-4 pl-14 pr-4 text-base font-mono tracking-wider text-white placeholder:text-[#888888] focus:outline-none focus:shadow-[0_0_20px_#CCFF00]" />
              </div>
              <div className="overflow-x-auto border-4 border-[#CCFF00]">
                {isLoading ? (
                  <div className="p-6"><SkeletonBlock className="h-[360px] w-full" /></div>
                ) : filteredActivities.length === 0 ? (
                  <div className="p-6"><EmptyState label={t("empty.activity")} /></div>
                ) : (
                  <table className="w-full min-w-[880px]">
                    <thead>
                      <tr className="border-b-4 border-[#CCFF00]">
                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.3em] text-[#CCFF00]">{t("activityTable.actor")}</th>
                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.3em] text-[#CCFF00]">{t("activityTable.action")}</th>
                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.3em] text-[#CCFF00]">{t("activityTable.target")}</th>
                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.3em] text-[#CCFF00]">{t("activityTable.description")}</th>
                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.3em] text-[#CCFF00]">{t("activityTable.createdAt")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredActivities.map((log) => (
                        <tr key={log.id} className="border-t-2 border-[#1a1a1a] bg-[#0a0a0a] transition-all hover:bg-[#111111]">
                          <td className="px-4 py-4 font-bold text-white">{log.actor}</td>
                          <td className="px-4 py-4 uppercase text-[#CCFF00]">{log.actionType}</td>
                          <td className="px-4 py-4 text-white">{log.targetTable}</td>
                          <td className="px-4 py-4 text-[#888888]">{log.description ?? "-"}</td>
                          <td className="px-4 py-4 text-sm text-[#888888]">{formatDateByLocale(log.createdAt, locale, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {isProductModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeProductModal} />
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto border-4 border-[#CCFF00] bg-[#0a0a0a] shadow-[0_0_40px_rgba(204,255,0,0.2)]">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b-4 border-[#CCFF00] bg-[#0a0a0a] p-6">
              <h3 className="text-2xl font-bold uppercase tracking-tighter text-white">{t("actions.createProduct")}</h3>
              <button onClick={closeProductModal} className="border-2 border-[#CCFF00] p-2 text-[#CCFF00] hover:bg-[#CCFF00] hover:text-[#0a0a0a]"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-6 p-6">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.3em] text-[#CCFF00]">{t("form.productName")}</label>
                <input value={productForm.name} onChange={(e) => setProductForm((prev) => ({ ...prev, name: e.target.value }))} className="w-full border-4 border-[#CCFF00] bg-[#0a0a0a] px-4 py-4 text-white placeholder:text-[#888888] focus:outline-none focus:shadow-[0_0_20px_#CCFF00]" placeholder={t("form.productName")} />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input value={productForm.slug} onChange={(e) => setProductForm((prev) => ({ ...prev, slug: e.target.value }))} className="w-full border-4 border-[#CCFF00] bg-[#0a0a0a] px-4 py-4 text-white placeholder:text-[#888888] focus:outline-none focus:shadow-[0_0_20px_#CCFF00]" placeholder={t("form.slugOptional")} />
                <input type="number" value={productForm.basePrice} onChange={(e) => setProductForm((prev) => ({ ...prev, basePrice: Number(e.target.value) }))} className="w-full border-4 border-[#CCFF00] bg-[#0a0a0a] px-4 py-4 text-white placeholder:text-[#888888] focus:outline-none focus:shadow-[0_0_20px_#CCFF00]" placeholder={t("form.basePrice")} />
                <select value={productForm.categoryId} onChange={(e) => setProductForm((prev) => ({ ...prev, categoryId: e.target.value }))} className="w-full border-4 border-[#CCFF00] bg-[#0a0a0a] px-4 py-4 text-white focus:outline-none focus:shadow-[0_0_20px_#CCFF00]">{(payload?.categories ?? []).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
                <select value={productForm.brandId} onChange={(e) => setProductForm((prev) => ({ ...prev, brandId: e.target.value }))} className="w-full border-4 border-[#CCFF00] bg-[#0a0a0a] px-4 py-4 text-white focus:outline-none focus:shadow-[0_0_20px_#CCFF00]"><option value="">{t("form.noBrand")}</option>{(payload?.brands ?? []).map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}</select>
                <input value={productForm.initialSize} onChange={(e) => setProductForm((prev) => ({ ...prev, initialSize: e.target.value }))} className="w-full border-4 border-[#CCFF00] bg-[#0a0a0a] px-4 py-4 text-white placeholder:text-[#888888] focus:outline-none focus:shadow-[0_0_20px_#CCFF00]" placeholder={t("form.initialSize")} />
                <input type="number" value={productForm.initialStock} onChange={(e) => setProductForm((prev) => ({ ...prev, initialStock: Number(e.target.value) }))} className="w-full border-4 border-[#CCFF00] bg-[#0a0a0a] px-4 py-4 text-white placeholder:text-[#888888] focus:outline-none focus:shadow-[0_0_20px_#CCFF00]" placeholder={t("form.initialStock")} />
              </div>
              <textarea rows={4} value={productForm.description} onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))} className="w-full resize-none border-4 border-[#CCFF00] bg-[#0a0a0a] px-4 py-4 text-white placeholder:text-[#888888] focus:outline-none focus:shadow-[0_0_20px_#CCFF00]" placeholder={t("form.description")} />
              <div className="flex flex-wrap items-center gap-4">
                <label className="inline-flex items-center gap-2 text-sm text-[#CCCCCC]"><input type="checkbox" checked={productForm.isPublished} onChange={(e) => setProductForm((prev) => ({ ...prev, isPublished: e.target.checked }))} />{t("form.published")}</label>
                <label className="inline-flex items-center gap-2 text-sm text-[#CCCCCC]"><input type="checkbox" checked={productForm.isFeatured} onChange={(e) => setProductForm((prev) => ({ ...prev, isFeatured: e.target.checked }))} />{t("form.featured")}</label>
              </div>
            </div>
            <div className="sticky bottom-0 flex items-center justify-end gap-4 border-t-4 border-[#CCFF00] bg-[#0a0a0a] p-6">
              <button onClick={closeProductModal} className="border-4 border-[#CCFF00] px-8 py-3 font-bold uppercase tracking-wider text-[#CCFF00] hover:bg-[#CCFF00]/10">{t("common.cancel")}</button>
              <button onClick={() => void handleCreateProduct()} disabled={isMutating || !productForm.name.trim() || !productForm.categoryId} className="border-4 border-[#CCFF00] bg-[#CCFF00] px-8 py-3 font-bold uppercase tracking-wider text-[#0a0a0a] hover:shadow-[0_0_30px_rgba(204,255,0,0.5)] disabled:opacity-50">{t("actions.create")}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
