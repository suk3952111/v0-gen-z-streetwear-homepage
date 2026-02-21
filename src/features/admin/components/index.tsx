"use client"

import { useMemo, useState } from "react"
import { Activity, LayoutDashboard, Package, RefreshCw, ShoppingCart } from "lucide-react"
import { mockOrders, mockStats, type AdminOrder } from "@/mocks/admin"
import { useI18n } from "@/lib/i18n/use-i18n"

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

  const formatPrice = (value: number) => {
    if (locale === "KR") return `${value.toLocaleString()}원`
    return `$${Math.round(value / 1000)}`
  }

  const statusLabel = (status: AdminOrder["status"]) => t(`statuses.${status}`)

  const statusColor = (status: AdminOrder["status"]) => {
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

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white px-4 md:px-8 py-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b-4 border-[#CCFF00] pb-4">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-[#CCFF00]">{t("title")}</h1>
        <button className="inline-flex items-center gap-2 border-2 border-[#CCFF00] px-4 py-2 text-[#CCFF00] hover:bg-[#CCFF00] hover:text-[#0a0a0a] transition-colors">
          <RefreshCw className="w-4 h-4" />
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

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label={t("stats.sales")} value={formatPrice(mockStats.sales)} />
        <StatCard label={t("stats.orders")} value={mockStats.orders.toString()} />
        <StatCard label={t("stats.pending")} value={mockStats.pending.toString()} />
        <StatCard label={t("stats.lowStock")} value={mockStats.lowStock.toString()} />
      </section>

      <section className="border-4 border-[#333333] p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-bold mb-4">{t("orderTable.title")}</h2>
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
              {mockOrders.map((order) => (
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
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
