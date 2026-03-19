"use client"

import { useEffect, useMemo, useState } from "react"
import { Activity, LayoutDashboard, Package, RefreshCw, ShoppingCart, Trash2 } from "lucide-react"
import { useI18n } from "@/lib/i18n/use-i18n"
import { loadAdminDashboardAction } from "@/features/admin/actions/load-dashboard"
import type { AdminDashboardPayload } from "@/features/admin/actions/load-dashboard/types"
import {
  createAdminProductAction,
  deleteAdminProductAction,
  updateAdminVariantStockAction,
} from "@/features/admin/actions/manage-catalog"

type Tab = "dashboard" | "products" | "orders" | "inventory" | "activity"

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="border-4 border-[#333333] p-4">
      <p className="mb-2 text-xs uppercase text-[#888888]">{label}</p>
      <p className="text-2xl font-bold text-[#CCFF00]">{value}</p>
    </article>
  )
}

export function AdminView() {
  const { locale, t } = useI18n("admin")
  const [activeTab, setActiveTab] = useState<Tab>("dashboard")
  const [isLoading, setIsLoading] = useState(true)
  const [isMutating, setIsMutating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [payload, setPayload] = useState<AdminDashboardPayload | null>(null)
  const [page, setPage] = useState(1)
  const [stockDeltaByVariant, setStockDeltaByVariant] = useState<Record<string, number>>({})
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

  const tabs = useMemo(
    () => [
      { id: "dashboard" as Tab, label: t("tabs.dashboard"), icon: LayoutDashboard },
      { id: "products" as Tab, label: t("tabs.products"), icon: Package },
      { id: "orders" as Tab, label: t("tabs.orders"), icon: ShoppingCart },
      { id: "inventory" as Tab, label: t("tabs.inventory"), icon: Package },
      { id: "activity" as Tab, label: t("tabs.activity"), icon: Activity },
    ],
    [t],
  )

  const loadDashboard = async (nextPage: number) => {
    setIsLoading(true)
    setErrorMessage(null)
    const response = await loadAdminDashboardAction({
      page: nextPage,
      pageSize,
    })
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

  const formatPrice = (value: number) => {
    if (locale === "KR") return `${Math.round(value).toLocaleString()} KRW`
    return `$${Math.max(1, Math.round(value / 1000))}`
  }

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString(locale === "KR" ? "ko-KR" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })

  const statusLabel = (status: string) => t(`statuses.${status}`)

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

  const totalPages = payload?.totalPages ?? 1
  const canPrev = page > 1
  const canNext = page < totalPages

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
    setProductForm((prev) => ({
      ...prev,
      name: "",
      slug: "",
      description: "",
      basePrice: 0,
      initialSize: "M",
      initialStock: 0,
      isFeatured: false,
    }))
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm(t("actions.confirmDeleteProduct"))) return
    await runMutation(async () => deleteAdminProductAction({ productId }))
  }

  const handleAdjustStock = async (variantId: string, delta: number) => {
    await runMutation(async () => updateAdminVariantStockAction({ variantId, delta }))
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-4 py-8 text-white md:px-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b-4 border-[#CCFF00] pb-4">
        <h1 className="text-3xl font-bold tracking-tighter text-[#CCFF00] md:text-5xl">{t("title")}</h1>
        <button
          onClick={() => void loadDashboard(page)}
          className="inline-flex items-center gap-2 border-2 border-[#CCFF00] px-4 py-2 text-[#CCFF00] transition-colors hover:bg-[#CCFF00] hover:text-[#0a0a0a] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isLoading || isMutating}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {t("refresh")}
        </button>
      </header>

      <div className="mb-8 flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const selected = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 border-2 px-4 py-2 text-sm font-bold uppercase transition-colors ${selected ? "border-[#CCFF00] bg-[#CCFF00] text-[#0a0a0a]" : "border-[#333333] text-[#888888] hover:border-[#CCFF00] hover:text-[#CCFF00]"}`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {errorMessage && <p className="mb-6 text-sm uppercase tracking-wider text-[#ff6666]">{errorMessage}</p>}

      {activeTab === "dashboard" && (
        <>
          <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label={t("stats.sales")} value={formatPrice(payload?.stats.sales ?? 0)} />
            <StatCard label={t("stats.orders")} value={(payload?.stats.orders ?? 0).toString()} />
            <StatCard label={t("stats.pending")} value={(payload?.stats.pending ?? 0).toString()} />
            <StatCard label={t("stats.lowStock")} value={(payload?.stats.lowStock ?? 0).toString()} />
          </section>

          <section className="border-4 border-[#333333] p-4 md:p-6">
            <h2 className="mb-4 text-xl font-bold md:text-2xl">{t("orderTable.title")}</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-[#333333] text-[#888888] uppercase">
                    <th className="py-2 text-left">{t("orderTable.orderNumber")}</th>
                    <th className="py-2 text-left">{t("orderTable.customer")}</th>
                    <th className="py-2 text-left">{t("orderTable.status")}</th>
                    <th className="py-2 text-right">{t("orderTable.total")}</th>
                  </tr>
                </thead>
                <tbody>
                  {(payload?.orders ?? []).slice(0, 5).map((order) => (
                    <tr key={order.id} className="border-b border-[#1a1a1a]">
                      <td className="py-3">{order.orderNumber}</td>
                      <td className="py-3">{order.customer}</td>
                      <td className="py-3">
                        <span className={`inline-block rounded px-2 py-1 text-xs font-bold ${statusColor(order.status)}`}>
                          {statusLabel(order.status)}
                        </span>
                      </td>
                      <td className="py-3 text-right">{formatPrice(order.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {activeTab === "products" && (
        <section className="space-y-6">
          <div className="border-4 border-[#CCFF00] p-4 md:p-6">
            <h2 className="mb-4 text-xl font-bold md:text-2xl">{t("actions.createProduct")}</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <input
                value={productForm.name}
                onChange={(e) => setProductForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder={t("form.productName")}
                className="border-2 border-[#333333] bg-[#0a0a0a] px-3 py-2 text-white focus:border-[#CCFF00] focus:outline-none"
              />
              <input
                value={productForm.slug}
                onChange={(e) => setProductForm((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder={t("form.slugOptional")}
                className="border-2 border-[#333333] bg-[#0a0a0a] px-3 py-2 text-white focus:border-[#CCFF00] focus:outline-none"
              />
              <input
                type="number"
                value={productForm.basePrice}
                onChange={(e) => setProductForm((prev) => ({ ...prev, basePrice: Number(e.target.value) }))}
                placeholder={t("form.basePrice")}
                className="border-2 border-[#333333] bg-[#0a0a0a] px-3 py-2 text-white focus:border-[#CCFF00] focus:outline-none"
              />
              <select
                value={productForm.categoryId}
                onChange={(e) => setProductForm((prev) => ({ ...prev, categoryId: e.target.value }))}
                className="border-2 border-[#333333] bg-[#0a0a0a] px-3 py-2 text-white focus:border-[#CCFF00] focus:outline-none"
              >
                {(payload?.categories ?? []).map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <select
                value={productForm.brandId}
                onChange={(e) => setProductForm((prev) => ({ ...prev, brandId: e.target.value }))}
                className="border-2 border-[#333333] bg-[#0a0a0a] px-3 py-2 text-white focus:border-[#CCFF00] focus:outline-none"
              >
                <option value="">{t("form.noBrand")}</option>
                {(payload?.brands ?? []).map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
              <input
                value={productForm.initialSize}
                onChange={(e) => setProductForm((prev) => ({ ...prev, initialSize: e.target.value }))}
                placeholder={t("form.initialSize")}
                className="border-2 border-[#333333] bg-[#0a0a0a] px-3 py-2 text-white focus:border-[#CCFF00] focus:outline-none"
              />
              <input
                type="number"
                value={productForm.initialStock}
                onChange={(e) => setProductForm((prev) => ({ ...prev, initialStock: Number(e.target.value) }))}
                placeholder={t("form.initialStock")}
                className="border-2 border-[#333333] bg-[#0a0a0a] px-3 py-2 text-white focus:border-[#CCFF00] focus:outline-none"
              />
              <input
                value={productForm.description}
                onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder={t("form.description")}
                className="border-2 border-[#333333] bg-[#0a0a0a] px-3 py-2 text-white focus:border-[#CCFF00] focus:outline-none md:col-span-2"
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <label className="inline-flex items-center gap-2 text-sm text-[#CCCCCC]">
                <input
                  type="checkbox"
                  checked={productForm.isPublished}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, isPublished: e.target.checked }))}
                />
                {t("form.published")}
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-[#CCCCCC]">
                <input
                  type="checkbox"
                  checked={productForm.isFeatured}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                />
                {t("form.featured")}
              </label>
              <button
                onClick={() => void handleCreateProduct()}
                disabled={isMutating || !productForm.name.trim() || !productForm.categoryId}
                className="border-2 border-[#CCFF00] bg-[#CCFF00] px-4 py-2 text-xs font-bold uppercase text-[#0a0a0a] transition-colors hover:bg-[#0a0a0a] hover:text-[#CCFF00] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("actions.create")}
              </button>
            </div>
          </div>

          <div className="border-4 border-[#333333] p-4 md:p-6">
            <h2 className="mb-4 text-xl font-bold md:text-2xl">{t("productsTable.title")}</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-sm">
                <thead>
                  <tr className="border-b border-[#333333] text-[#888888] uppercase">
                    <th className="py-2 text-left">{t("productsTable.name")}</th>
                    <th className="py-2 text-left">{t("productsTable.brand")}</th>
                    <th className="py-2 text-left">{t("productsTable.category")}</th>
                    <th className="py-2 text-right">{t("productsTable.price")}</th>
                    <th className="py-2 text-left">{t("productsTable.publish")}</th>
                    <th className="py-2 text-left">{t("productsTable.featured")}</th>
                    <th className="py-2 text-left">{t("productsTable.updatedAt")}</th>
                    <th className="py-2 text-left">{t("actions.manage")}</th>
                  </tr>
                </thead>
                <tbody>
                  {(payload?.products ?? []).map((product) => (
                    <tr key={product.id} className="border-b border-[#1a1a1a]">
                      <td className="py-3">
                        <div className="font-bold">{product.name}</div>
                        <div className="text-xs text-[#888888]">/{product.slug}</div>
                      </td>
                      <td className="py-3">{product.brand}</td>
                      <td className="py-3">{product.category}</td>
                      <td className="py-3 text-right">{formatPrice(product.basePrice)}</td>
                      <td className="py-3">
                        <span className={product.isPublished ? "text-[#00FF88]" : "text-[#FFCC00]"}>
                          {product.isPublished ? t("common.yes") : t("common.no")}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={product.isFeatured ? "text-[#00FF88]" : "text-[#888888]"}>
                          {product.isFeatured ? t("common.yes") : t("common.no")}
                        </span>
                      </td>
                      <td className="py-3">{formatDate(product.updatedAt)}</td>
                      <td className="py-3">
                        <button
                          onClick={() => void handleDeleteProduct(product.id)}
                          disabled={isMutating}
                          className="inline-flex items-center gap-1 border-2 border-[#FF4444] px-2 py-1 text-xs font-bold uppercase text-[#FF4444] transition-colors hover:bg-[#FF4444] hover:text-[#0a0a0a] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {t("actions.delete")}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {activeTab === "orders" && (
        <section className="border-4 border-[#333333] p-4 md:p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold md:text-2xl">{t("orderTable.title")}</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => void loadDashboard(page - 1)}
                disabled={!canPrev || isLoading || isMutating}
                className="border-2 border-[#333333] px-3 py-1 text-xs font-bold uppercase text-[#888888] hover:border-[#CCFF00] hover:text-[#CCFF00] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Prev
              </button>
              <span className="text-xs uppercase text-[#888888]">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => void loadDashboard(page + 1)}
                disabled={!canNext || isLoading || isMutating}
                className="border-2 border-[#333333] px-3 py-1 text-xs font-bold uppercase text-[#888888] hover:border-[#CCFF00] hover:text-[#CCFF00] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-[#333333] text-[#888888] uppercase">
                  <th className="py-2 text-left">{t("orderTable.orderNumber")}</th>
                  <th className="py-2 text-left">{t("orderTable.customer")}</th>
                  <th className="py-2 text-left">{t("orderTable.status")}</th>
                  <th className="py-2 text-right">{t("orderTable.total")}</th>
                </tr>
              </thead>
              <tbody>
                {(payload?.orders ?? []).map((order) => (
                  <tr key={order.id} className="border-b border-[#1a1a1a]">
                    <td className="py-3">{order.orderNumber}</td>
                    <td className="py-3">{order.customer}</td>
                    <td className="py-3">
                      <span className={`inline-block rounded px-2 py-1 text-xs font-bold ${statusColor(order.status)}`}>
                        {statusLabel(order.status)}
                      </span>
                    </td>
                    <td className="py-3 text-right">{formatPrice(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === "inventory" && (
        <section className="border-4 border-[#333333] p-4 md:p-6">
          <h2 className="mb-4 text-xl font-bold md:text-2xl">{t("inventoryTable.title")}</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead>
                <tr className="border-b border-[#333333] text-[#888888] uppercase">
                  <th className="py-2 text-left">{t("inventoryTable.product")}</th>
                  <th className="py-2 text-left">{t("inventoryTable.size")}</th>
                  <th className="py-2 text-right">{t("inventoryTable.stock")}</th>
                  <th className="py-2 text-left">{t("inventoryTable.active")}</th>
                  <th className="py-2 text-left">{t("inventoryTable.updatedAt")}</th>
                  <th className="py-2 text-left">{t("actions.manage")}</th>
                </tr>
              </thead>
              <tbody>
                {(payload?.lowStockItems ?? []).map((item) => (
                  <tr key={item.id} className="border-b border-[#1a1a1a]">
                    <td className="py-3">
                      <div className="font-bold">{item.productName}</div>
                      <div className="text-xs text-[#888888]">/{item.productSlug}</div>
                    </td>
                    <td className="py-3">{item.size}</td>
                    <td className={`py-3 text-right font-bold ${item.stockQuantity <= 2 ? "text-[#FF4444]" : "text-[#FFCC00]"}`}>
                      {item.stockQuantity}
                    </td>
                    <td className="py-3">
                      <span className={item.isActive ? "text-[#00FF88]" : "text-[#888888]"}>
                        {item.isActive ? t("common.yes") : t("common.no")}
                      </span>
                    </td>
                    <td className="py-3">{formatDate(item.updatedAt)}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {[1, 5, 10].map((value) => (
                          <button
                            key={value}
                            onClick={() => void handleAdjustStock(item.id, value)}
                            disabled={isMutating}
                            className="border-2 border-[#CCFF00] px-2 py-1 text-xs font-bold uppercase text-[#CCFF00] transition-colors hover:bg-[#CCFF00] hover:text-[#0a0a0a] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            +{value}
                          </button>
                        ))}
                        <input
                          type="number"
                          value={stockDeltaByVariant[item.id] ?? 0}
                          onChange={(e) =>
                            setStockDeltaByVariant((prev) => ({
                              ...prev,
                              [item.id]: Number(e.target.value),
                            }))
                          }
                          className="w-20 border-2 border-[#333333] bg-[#0a0a0a] px-2 py-1 text-white focus:border-[#CCFF00] focus:outline-none"
                        />
                        <button
                          onClick={() => void handleAdjustStock(item.id, Number(stockDeltaByVariant[item.id] ?? 0))}
                          disabled={isMutating || Number(stockDeltaByVariant[item.id] ?? 0) === 0}
                          className="border-2 border-[#00CCFF] px-2 py-1 text-xs font-bold uppercase text-[#00CCFF] transition-colors hover:bg-[#00CCFF] hover:text-[#0a0a0a] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {t("actions.applyDelta")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === "activity" && (
        <section className="border-4 border-[#333333] p-4 md:p-6">
          <h2 className="mb-4 text-xl font-bold md:text-2xl">{t("activityTable.title")}</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-sm">
              <thead>
                <tr className="border-b border-[#333333] text-[#888888] uppercase">
                  <th className="py-2 text-left">{t("activityTable.actor")}</th>
                  <th className="py-2 text-left">{t("activityTable.action")}</th>
                  <th className="py-2 text-left">{t("activityTable.target")}</th>
                  <th className="py-2 text-left">{t("activityTable.description")}</th>
                  <th className="py-2 text-left">{t("activityTable.createdAt")}</th>
                </tr>
              </thead>
              <tbody>
                {(payload?.activities ?? []).map((log) => (
                  <tr key={log.id} className="border-b border-[#1a1a1a]">
                    <td className="py-3">{log.actor}</td>
                    <td className="py-3 uppercase">{log.actionType}</td>
                    <td className="py-3">{log.targetTable}</td>
                    <td className="py-3">{log.description ?? "-"}</td>
                    <td className="py-3">{formatDate(log.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  )
}
