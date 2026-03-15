"use client"

import { useEffect, useMemo, useState } from "react"
import { Activity, LayoutDashboard, Package, RefreshCw, ShoppingCart } from "lucide-react"
import { useI18n } from "@/lib/i18n/use-i18n"
import { loadAdminDashboardAction } from "@/features/admin/actions/load-dashboard"
import type { AdminDashboardPayload } from "@/features/admin/actions/load-dashboard/types"

type Tab = "dashboard" | "products" | "orders" | "inventory" | "activity"

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="border-4 border-[#333333] p-4">
      <p className="text-xs uppercase text-[#888888] mb-2">{label}</p>
      <p className="text-2xl font-bold text-[#CCFF00]">{value}</p>
    </article>
  )
}

export function AdminView() {
  const { locale, t } = useI18n("admin")
  const [activeTab, setActiveTab] = useState<Tab>("dashboard")
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [payload, setPayload] = useState<AdminDashboardPayload | null>(null)
  const [page, setPage] = useState(1)
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

  const formatPrice = (value: number) => {
    if (locale === "KR") return `${Math.round(value).toLocaleString()}원`
    return `$${Math.round(value / 1000)}`
  }

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

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white px-4 md:px-8 py-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b-4 border-[#CCFF00] pb-4">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-[#CCFF00]">{t("title")}</h1>
        <button
          onClick={() => void loadDashboard(page)}
          className="inline-flex items-center gap-2 border-2 border-[#CCFF00] px-4 py-2 text-[#CCFF00] hover:bg-[#CCFF00] hover:text-[#0a0a0a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
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
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {errorMessage && <p className="mb-6 text-[#ff6666] text-sm uppercase tracking-wider">{errorMessage}</p>}

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label={t("stats.sales")} value={formatPrice(payload?.stats.sales ?? 0)} />
        <StatCard label={t("stats.orders")} value={(payload?.stats.orders ?? 0).toString()} />
        <StatCard label={t("stats.pending")} value={(payload?.stats.pending ?? 0).toString()} />
        <StatCard label={t("stats.lowStock")} value={(payload?.stats.lowStock ?? 0).toString()} />
      </section>

      <section className="border-4 border-[#333333] p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl md:text-2xl font-bold">{t("orderTable.title")}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => void loadDashboard(page - 1)}
              disabled={!canPrev || isLoading}
              className="border-2 border-[#333333] px-3 py-1 text-xs font-bold uppercase text-[#888888] hover:border-[#CCFF00] hover:text-[#CCFF00] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            <span className="text-xs uppercase text-[#888888]">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => void loadDashboard(page + 1)}
              disabled={!canNext || isLoading}
              className="border-2 border-[#333333] px-3 py-1 text-xs font-bold uppercase text-[#888888] hover:border-[#CCFF00] hover:text-[#CCFF00] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-[#333333] text-[#888888] uppercase">
                <th className="text-left py-2">{t("orderTable.orderNumber")}</th>
                <th className="text-left py-2">{t("orderTable.customer")}</th>
                <th className="text-left py-2">{t("orderTable.status")}</th>
                <th className="text-right py-2">{t("orderTable.total")}</th>
              </tr>
            </thead>
            <tbody>
              {(payload?.orders ?? []).map((order) => (
                <tr key={order.id} className="border-b border-[#1a1a1a]">
                  <td className="py-3">{order.orderNumber}</td>
                  <td className="py-3">{order.customer}</td>
                  <td className="py-3">
                    <span className={`inline-block px-2 py-1 text-xs font-bold rounded ${statusColor(order.status)}`}>
                      {statusLabel(order.status)}
                    </span>
                  </td>
                  <td className="py-3 text-right">{formatPrice(order.total)}</td>
                </tr>
              ))}
              {!isLoading && (payload?.orders.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-[#888888] uppercase tracking-wider text-xs">
                    No orders
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}

