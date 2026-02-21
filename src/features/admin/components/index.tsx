"use client"

import { useMemo, useState } from "react"
import { Activity, LayoutDashboard, Package, RefreshCw, ShoppingCart } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"
import { mockOrders, mockStats, type AdminOrder } from "@/mocks/admin"

type Tab = "dashboard" | "products" | "orders" | "inventory" | "activity"

const ui = {
  EN: {
    title: "ADMIN PANEL",
    tabs: { dashboard: "DASHBOARD", products: "PRODUCTS", orders: "ORDERS", inventory: "INVENTORY", activity: "ACTIVITY" },
    stats: { sales: "TOTAL SALES", orders: "TOTAL ORDERS", pending: "PENDING ORDERS", lowStock: "LOW STOCK" },
    orderTable: { title: "ORDER MANAGEMENT", orderNumber: "ORDER #", customer: "CUSTOMER", status: "STATUS", total: "TOTAL" },
    refresh: "REFRESH",
  },
  KR: {
    title: "관리자 패널",
    tabs: { dashboard: "대시보드", products: "상품 관리", orders: "주문 관리", inventory: "재고 관리", activity: "활동 로그" },
    stats: { sales: "총 매출", orders: "총 주문", pending: "처리 대기", lowStock: "재고 부족" },
    orderTable: { title: "주문 관리", orderNumber: "주문번호", customer: "고객", status: "상태", total: "금액" },
    refresh: "새로고침",
  },
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="border-4 border-[#333333] p-4">
      <p className="text-xs uppercase text-[#888888] mb-2">{label}</p>
      <p className="text-2xl font-bold text-[#CCFF00]">{value}</p>
    </article>
  )
}

export function AdminView() {
  const { language } = useLanguage()
  const t = language === "KR" ? ui.KR : ui.EN
  const [activeTab, setActiveTab] = useState<Tab>("dashboard")

  const tabs = useMemo(
    () => [
      { id: "dashboard" as Tab, label: t.tabs.dashboard, icon: LayoutDashboard },
      { id: "products" as Tab, label: t.tabs.products, icon: Package },
      { id: "orders" as Tab, label: t.tabs.orders, icon: ShoppingCart },
      { id: "inventory" as Tab, label: t.tabs.inventory, icon: Package },
      { id: "activity" as Tab, label: t.tabs.activity, icon: Activity },
    ],
    [t],
  )

  const formatPrice = (value: number) => {
    if (language === "KR") return `${value.toLocaleString()}원`
    return `$${Math.round(value / 1000)}`
  }

  const statusLabel = (status: AdminOrder["status"]) => {
    if (language !== "KR") return status.toUpperCase()
    switch (status) {
      case "pending": return "주문대기"
      case "confirmed": return "주문확인"
      case "shipped": return "배송중"
      case "delivered": return "배송완료"
      case "cancelled": return "취소됨"
      default: return status
    }
  }

  const statusColor = (status: AdminOrder["status"]) => {
    switch (status) {
      case "delivered": return "bg-[#00FF88] text-[#0a0a0a]"
      case "shipped": return "bg-[#00CCFF] text-[#0a0a0a]"
      case "confirmed":
      case "pending": return "bg-[#FFCC00] text-[#0a0a0a]"
      case "cancelled": return "bg-[#FF4444] text-white"
      default: return "bg-[#333333] text-white"
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white px-4 md:px-8 py-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b-4 border-[#CCFF00] pb-4">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-[#CCFF00]">{t.title}</h1>
        <button className="inline-flex items-center gap-2 border-2 border-[#CCFF00] px-4 py-2 text-[#CCFF00] hover:bg-[#CCFF00] hover:text-[#0a0a0a] transition-colors">
          <RefreshCw className="w-4 h-4" />
          {t.refresh}
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
        <StatCard label={t.stats.sales} value={formatPrice(mockStats.sales)} />
        <StatCard label={t.stats.orders} value={mockStats.orders.toString()} />
        <StatCard label={t.stats.pending} value={mockStats.pending.toString()} />
        <StatCard label={t.stats.lowStock} value={mockStats.lowStock.toString()} />
      </section>

      <section className="border-4 border-[#333333] p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-bold mb-4">{t.orderTable.title}</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-[#333333] text-[#888888] uppercase">
                <th className="text-left py-2">{t.orderTable.orderNumber}</th>
                <th className="text-left py-2">{t.orderTable.customer}</th>
                <th className="text-left py-2">{t.orderTable.status}</th>
                <th className="text-right py-2">{t.orderTable.total}</th>
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
