"use client"

import { useState } from "react"
import Image from "next/image"
import { useLanguage } from "@/components/providers/language-provider"
import { 
  LayoutDashboard, Package, ShoppingCart, Users, Activity,
  TrendingUp, TrendingDown, AlertTriangle, Search, Filter,
  Edit2, Eye, Trash2, ChevronLeft, ChevronRight, RefreshCw,
  Plus, Clock, CheckCircle, XCircle, Truck
} from "lucide-react"

const content = {
  EN: {
    title: "ADMIN",
    titleAccent: "PANEL",
    nav: {
      dashboard: "DASHBOARD",
      products: "PRODUCTS",
      orders: "ORDERS",
      inventory: "INVENTORY",
      activity: "ACTIVITY LOG",
    },
    stats: {
      totalSales: "TOTAL SALES",
      totalOrders: "TOTAL ORDERS",
      pendingOrders: "PENDING",
      lowStock: "LOW STOCK ALERTS",
    },
    products: {
      title: "PRODUCT MANAGEMENT",
      search: "Search products...",
      addProduct: "ADD PRODUCT",
      name: "PRODUCT NAME",
      sku: "SKU",
      stock: "STOCK",
      price: "PRICE",
      status: "STATUS",
      actions: "ACTIONS",
      published: "PUBLISHED",
      draft: "DRAFT",
      edit: "EDIT",
      view: "VIEW",
      delete: "DELETE",
    },
    orders: {
      title: "ORDER MANAGEMENT",
      search: "Search orders...",
      orderNumber: "ORDER #",
      customer: "CUSTOMER",
      date: "DATE",
      status: "STATUS",
      total: "TOTAL",
      paymentStatus: "PAYMENT",
      actions: "ACTIONS",
      updateStatus: "UPDATE STATUS",
      statuses: {
        pending: "PENDING",
        confirmed: "CONFIRMED", 
        shipped: "SHIPPED",
        delivered: "DELIVERED",
        cancelled: "CANCELLED",
      },
      paymentStatuses: {
        pending: "PENDING",
        completed: "COMPLETED",
        failed: "FAILED",
        refunded: "REFUNDED",
      }
    },
    inventory: {
      title: "INVENTORY TRACKING",
      productVariant: "PRODUCT / VARIANT",
      sku: "SKU",
      size: "SIZE",
      color: "COLOR",
      stock: "STOCK QTY",
      status: "STATUS",
      inStock: "IN STOCK",
      lowStock: "LOW STOCK",
      outOfStock: "OUT OF STOCK",
      updateStock: "UPDATE",
    },
    activity: {
      title: "ADMIN ACTIVITY LOG",
      admin: "ADMIN",
      action: "ACTION",
      target: "TARGET",
      time: "TIME",
      ip: "IP ADDRESS",
      actionTypes: {
        create: "CREATE",
        update: "UPDATE",
        delete: "DELETE",
        login: "LOGIN",
        logout: "LOGOUT",
      }
    },
    refresh: "REFRESH",
    showing: "Showing",
    of: "of",
  },
  KR: {
    title: "관리자",
    titleAccent: "대시보드",
    nav: {
      dashboard: "대시보드",
      products: "상품 관리",
      orders: "주문 관리",
      inventory: "재고 관리",
      activity: "활동 로그",
    },
    stats: {
      totalSales: "총 매출",
      totalOrders: "총 주문",
      pendingOrders: "처리 대기",
      lowStock: "재고 부족 알림",
    },
    products: {
      title: "상품 관리",
      search: "상품 검색...",
      addProduct: "상품 추가",
      name: "상품명",
      sku: "SKU",
      stock: "재고",
      price: "가격",
      status: "상태",
      actions: "관리",
      published: "공개",
      draft: "비공개",
      edit: "수정",
      view: "보기",
      delete: "삭제",
    },
    orders: {
      title: "주문 관리",
      search: "주문 검색...",
      orderNumber: "주문번호",
      customer: "고객",
      date: "날짜",
      status: "상태",
      total: "총액",
      paymentStatus: "결제 상태",
      actions: "관리",
      updateStatus: "상태 변경",
      statuses: {
        pending: "주문대기",
        confirmed: "주문확인", 
        shipped: "배송중",
        delivered: "배송완료",
        cancelled: "취소됨",
      },
      paymentStatuses: {
        pending: "결제대기",
        completed: "결제완료",
        failed: "결제실패",
        refunded: "환불완료",
      }
    },
    inventory: {
      title: "재고 관리",
      productVariant: "상품 / 옵션",
      sku: "SKU",
      size: "사이즈",
      color: "색상",
      stock: "재고 수량",
      status: "상태",
      inStock: "재고 있음",
      lowStock: "재고 부족",
      outOfStock: "품절",
      updateStock: "수정",
    },
    activity: {
      title: "관리자 활동 로그",
      admin: "관리자",
      action: "활동",
      target: "대상",
      time: "시간",
      ip: "IP 주소",
      actionTypes: {
        create: "생성",
        update: "수정",
        delete: "삭제",
        login: "로그인",
        logout: "로그아웃",
      }
    },
    refresh: "새로고침",
    showing: "표시",
    of: "/",
  },
}

// Mock data
const mockStats = {
  totalSales: 12450000,
  totalOrders: 156,
  pendingOrders: 12,
  lowStockItems: 8,
}

const mockProducts = [
  { id: "hoodie-001", name: "사이버 후디 3000", sku: "VB-HD-001", stock_quantity: 45, base_price: 189000, is_published: true, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=100&h=100&fit=crop" },
  { id: "hoodie-002", name: "PHANTOM ZIP-UP", sku: "VB-HD-002", stock_quantity: 8, base_price: 215000, is_published: true, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=100&h=100&fit=crop" },
  { id: "pants-001", name: "GLITCH CARGO PANTS", sku: "VB-PT-001", stock_quantity: 0, base_price: 145000, is_published: true, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=100&h=100&fit=crop" },
  { id: "jacket-001", name: "PIXEL VARSITY JACKET", sku: "VB-JK-001", stock_quantity: 23, base_price: 265000, is_published: false, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=100&h=100&fit=crop" },
  { id: "acc-001", name: "바이너리 비니", sku: "VB-AC-001", stock_quantity: 67, base_price: 45000, is_published: true, image: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=100&h=100&fit=crop" },
]

const mockOrders = [
  { id: "order-001", order_number: "VC-2024-001234", customer: "홍길동", email: "hong@email.com", status: "pending", payment_status: "completed", final_amount: 189000, created_at: "2024-01-20T09:00:00Z" },
  { id: "order-002", order_number: "VC-2024-001235", customer: "CYBER_KID", email: "cyber@email.com", status: "shipped", payment_status: "completed", final_amount: 410000, created_at: "2024-01-19T14:30:00Z" },
  { id: "order-003", order_number: "VC-2024-001236", customer: "스트릿워리어", email: "street@email.com", status: "delivered", payment_status: "completed", final_amount: 265000, created_at: "2024-01-18T11:20:00Z" },
  { id: "order-004", order_number: "VC-2024-001237", customer: "TECHWEAR_FAN", email: "tech@email.com", status: "cancelled", payment_status: "refunded", final_amount: 145000, created_at: "2024-01-17T16:45:00Z" },
]

const mockInventory = [
  { id: "var-001", product_name: "사이버 후디 3000", sku: "VB-HD-001-S-BK", size: "S", color: "BLACK", stock_quantity: 12 },
  { id: "var-002", product_name: "사이버 후디 3000", sku: "VB-HD-001-M-BK", size: "M", color: "BLACK", stock_quantity: 18 },
  { id: "var-003", product_name: "사이버 후디 3000", sku: "VB-HD-001-L-BK", size: "L", color: "BLACK", stock_quantity: 5 },
  { id: "var-004", product_name: "PHANTOM ZIP-UP", sku: "VB-HD-002-M-GR", size: "M", color: "GRAY", stock_quantity: 3 },
  { id: "var-005", product_name: "GLITCH CARGO PANTS", sku: "VB-PT-001-32-BK", size: "32", color: "BLACK", stock_quantity: 0 },
  { id: "var-006", product_name: "PIXEL VARSITY JACKET", sku: "VB-JK-001-L-NV", size: "L", color: "NAVY", stock_quantity: 15 },
]

const mockActivityLogs = [
  { id: "log-001", admin_id: "admin-001", admin_name: "SUPER_ADMIN", action_type: "update", target_table: "orders", target_id: "order-001", description: "주문 상태 변경: pending → shipped", ip_address: "192.168.1.100", created_at: "2024-01-20T10:30:00Z" },
  { id: "log-002", admin_id: "admin-001", admin_name: "SUPER_ADMIN", action_type: "create", target_table: "products", target_id: "hoodie-005", description: "새 상품 추가: NEON TECH HOODIE", ip_address: "192.168.1.100", created_at: "2024-01-20T09:15:00Z" },
  { id: "log-003", admin_id: "admin-002", admin_name: "MOD_USER", action_type: "update", target_table: "product_variants", target_id: "var-003", description: "재고 수량 변경: 15 → 5", ip_address: "192.168.1.105", created_at: "2024-01-19T16:45:00Z" },
  { id: "log-004", admin_id: "admin-001", admin_name: "SUPER_ADMIN", action_type: "delete", target_table: "reviews", target_id: "rev-010", description: "부적절한 리뷰 삭제", ip_address: "192.168.1.100", created_at: "2024-01-19T14:20:00Z" },
  { id: "log-005", admin_id: "admin-002", admin_name: "MOD_USER", action_type: "login", target_table: "users", target_id: null, description: "관리자 로그인", ip_address: "192.168.1.105", created_at: "2024-01-19T09:00:00Z" },
]

type Tab = "dashboard" | "products" | "orders" | "inventory" | "activity"

export default function AdminPage() {
  const { language } = useLanguage()
  const [activeTab, setActiveTab] = useState<Tab>("dashboard")
  const [searchQuery, setSearchQuery] = useState("")
  
  const t = content[language]

  const formatPrice = (amount: number) => {
    return language === "KR" ? `${amount.toLocaleString()}원` : `$${Math.round(amount / 1000)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === "KR" ? "ko-KR" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered": 
      case "completed": return "bg-[#00FF88] text-[#0a0a0a]"
      case "shipped": return "bg-[#00CCFF] text-[#0a0a0a]"
      case "confirmed":
      case "pending": return "bg-[#FFCC00] text-[#0a0a0a]"
      case "cancelled":
      case "failed":
      case "refunded": return "bg-[#FF4444] text-white"
      default: return "bg-[#333333] text-white"
    }
  }

  const getStockStatus = (qty: number) => {
    if (qty === 0) return { label: t.inventory.outOfStock, color: "text-[#FF4444]" }
    if (qty <= 5) return { label: t.inventory.lowStock, color: "text-[#FFCC00]" }
    return { label: t.inventory.inStock, color: "text-[#00FF88]" }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "create": return "text-[#00FF88]"
      case "update": return "text-[#CCFF00]"
      case "delete": return "text-[#FF4444]"
      case "login":
      case "logout": return "text-[#00CCFF]"
      default: return "text-white"
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Admin Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b-4 border-[#CCFF00] bg-[#0a0a0a]">
        <div className="flex items-center justify-between px-4 py-4 md:px-8">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-[#CCFF00] tracking-tighter">
              VIBE CHECK <span className="text-white">{t.titleAccent}</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 border-2 border-[#333333]">
              <div className="w-3 h-3 bg-[#00FF88] rounded-full animate-pulse" />
              <span className="text-[#888888] text-sm uppercase">ADMIN ONLINE</span>
            </div>
            <button className="p-2 border-2 border-[#CCFF00] text-[#CCFF00] hover:bg-[#CCFF00] hover:text-[#0a0a0a] transition-colors">
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex pt-[72px]">
        {/* Sidebar */}
        <aside className="fixed left-0 top-[72px] bottom-0 w-64 border-r-4 border-[#CCFF00] bg-[#0a0a0a] hidden lg:block">
          <nav className="p-4 space-y-2">
            {[
              { id: "dashboard" as Tab, icon: LayoutDashboard, label: t.nav.dashboard },
              { id: "products" as Tab, icon: Package, label: t.nav.products },
              { id: "orders" as Tab, icon: ShoppingCart, label: t.nav.orders },
              { id: "inventory" as Tab, icon: Package, label: t.nav.inventory },
              { id: "activity" as Tab, icon: Activity, label: t.nav.activity },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 font-bold uppercase tracking-wider transition-colors ${
                  activeTab === item.id
                    ? "bg-[#CCFF00] text-[#0a0a0a]"
                    : "text-white hover:bg-[#1a1a1a] hover:text-[#CCFF00]"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Stats Summary */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t-4 border-[#333333]">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[#888888] text-xs uppercase">{t.stats.pendingOrders}</span>
                <span className="text-[#FFCC00] font-bold">{mockStats.pendingOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#888888] text-xs uppercase">{t.stats.lowStock}</span>
                <span className="text-[#FF4444] font-bold">{mockStats.lowStockItems}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Tab Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t-4 border-[#CCFF00] bg-[#0a0a0a] lg:hidden">
          <div className="flex justify-around p-2">
            {[
              { id: "dashboard" as Tab, icon: LayoutDashboard },
              { id: "products" as Tab, icon: Package },
              { id: "orders" as Tab, icon: ShoppingCart },
              { id: "inventory" as Tab, icon: Package },
              { id: "activity" as Tab, icon: Activity },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`p-3 transition-colors ${
                  activeTab === item.id
                    ? "text-[#CCFF00]"
                    : "text-[#888888] hover:text-white"
                }`}
              >
                <item.icon className="w-6 h-6" />
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-64 p-4 md:p-8 pb-24 lg:pb-8">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white uppercase tracking-tighter">
                {t.nav.dashboard}
              </h2>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="border-4 border-[#CCFF00] p-6">
                  <TrendingUp className="w-8 h-8 text-[#00FF88] mb-4" />
                  <p className="text-[#888888] text-xs uppercase tracking-wider mb-1">{t.stats.totalSales}</p>
                  <p className="text-3xl font-bold text-white">{formatPrice(mockStats.totalSales)}</p>
                </div>
                <div className="border-4 border-[#CCFF00] p-6">
                  <ShoppingCart className="w-8 h-8 text-[#CCFF00] mb-4" />
                  <p className="text-[#888888] text-xs uppercase tracking-wider mb-1">{t.stats.totalOrders}</p>
                  <p className="text-3xl font-bold text-white">{mockStats.totalOrders}</p>
                </div>
                <div className="border-4 border-[#FFCC00] p-6">
                  <Clock className="w-8 h-8 text-[#FFCC00] mb-4" />
                  <p className="text-[#888888] text-xs uppercase tracking-wider mb-1">{t.stats.pendingOrders}</p>
                  <p className="text-3xl font-bold text-[#FFCC00]">{mockStats.pendingOrders}</p>
                </div>
                <div className="border-4 border-[#FF4444] p-6">
                  <AlertTriangle className="w-8 h-8 text-[#FF4444] mb-4" />
                  <p className="text-[#888888] text-xs uppercase tracking-wider mb-1">{t.stats.lowStock}</p>
                  <p className="text-3xl font-bold text-[#FF4444]">{mockStats.lowStockItems}</p>
                </div>
              </div>

              {/* Recent Orders Preview */}
              <div className="border-4 border-[#CCFF00] p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white uppercase">{t.orders.title}</h3>
                  <button onClick={() => setActiveTab("orders")} className="text-[#CCFF00] text-sm font-bold uppercase hover:underline">
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {mockOrders.slice(0, 3).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-[#1a1a1a] border-2 border-[#333333]">
                      <div>
                        <p className="text-white font-bold">{order.order_number}</p>
                        <p className="text-[#888888] text-sm">{order.customer}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-3 py-1 text-xs font-bold uppercase ${getStatusColor(order.status)}`}>
                          {t.orders.statuses[order.status as keyof typeof t.orders.statuses]}
                        </span>
                        <p className="text-[#CCFF00] font-bold mt-1">{formatPrice(order.final_amount)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Low Stock Alerts */}
              <div className="border-4 border-[#FF4444] p-6">
                <div className="flex items-center gap-3 mb-6">
                  <AlertTriangle className="w-6 h-6 text-[#FF4444]" />
                  <h3 className="text-xl font-bold text-white uppercase">{t.stats.lowStock}</h3>
                </div>
                <div className="space-y-3">
                  {mockInventory.filter(item => item.stock_quantity <= 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-[#1a1a1a] border-l-4 border-[#FF4444]">
                      <div>
                        <p className="text-white font-bold">{item.product_name}</p>
                        <p className="text-[#888888] text-sm">{item.sku} | {item.size} | {item.color}</p>
                      </div>
                      <span className={`font-bold ${item.stock_quantity === 0 ? "text-[#FF4444]" : "text-[#FFCC00]"}`}>
                        {item.stock_quantity} left
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === "products" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h2 className="text-3xl font-bold text-white uppercase tracking-tighter">
                  {t.products.title}
                </h2>
                <button className="flex items-center gap-2 px-6 py-3 bg-[#CCFF00] text-[#0a0a0a] font-bold uppercase tracking-wider border-4 border-[#CCFF00] hover:bg-[#0a0a0a] hover:text-[#CCFF00] transition-colors">
                  <Plus className="w-5 h-5" />
                  {t.products.addProduct}
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888888]" />
                <input
                  type="text"
                  placeholder={t.products.search}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-[#1a1a1a] border-2 border-[#333333] text-white placeholder-[#666666] focus:border-[#CCFF00] focus:outline-none uppercase"
                />
              </div>

              {/* Products Table */}
              <div className="border-4 border-[#CCFF00] overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#CCFF00] text-[#0a0a0a]">
                      <th className="px-4 py-3 text-left font-bold uppercase text-sm">{t.products.name}</th>
                      <th className="px-4 py-3 text-left font-bold uppercase text-sm">{t.products.sku}</th>
                      <th className="px-4 py-3 text-left font-bold uppercase text-sm">{t.products.stock}</th>
                      <th className="px-4 py-3 text-left font-bold uppercase text-sm">{t.products.price}</th>
                      <th className="px-4 py-3 text-left font-bold uppercase text-sm">{t.products.status}</th>
                      <th className="px-4 py-3 text-right font-bold uppercase text-sm">{t.products.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockProducts.map((product, index) => (
                      <tr key={product.id} className={`border-t-2 border-[#333333] ${index % 2 === 0 ? "bg-[#0a0a0a]" : "bg-[#111111]"}`}>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 border-2 border-[#333333]">
                              <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                            </div>
                            <span className="text-white font-bold">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-[#888888] font-mono text-sm">{product.sku}</td>
                        <td className="px-4 py-4">
                          <span className={getStockStatus(product.stock_quantity).color}>
                            {product.stock_quantity}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-[#CCFF00] font-bold">{formatPrice(product.base_price)}</td>
                        <td className="px-4 py-4">
                          <span className={`px-3 py-1 text-xs font-bold uppercase ${product.is_published ? "bg-[#00FF88] text-[#0a0a0a]" : "bg-[#333333] text-[#888888]"}`}>
                            {product.is_published ? t.products.published : t.products.draft}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-2 text-[#888888] hover:text-[#CCFF00] transition-colors" title={t.products.view}>
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-[#888888] hover:text-[#CCFF00] transition-colors" title={t.products.edit}>
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-[#888888] hover:text-[#FF4444] transition-colors" title={t.products.delete}>
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white uppercase tracking-tighter">
                {t.orders.title}
              </h2>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888888]" />
                <input
                  type="text"
                  placeholder={t.orders.search}
                  className="w-full pl-12 pr-4 py-3 bg-[#1a1a1a] border-2 border-[#333333] text-white placeholder-[#666666] focus:border-[#CCFF00] focus:outline-none uppercase"
                />
              </div>

              {/* Orders Table */}
              <div className="border-4 border-[#CCFF00] overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#CCFF00] text-[#0a0a0a]">
                      <th className="px-4 py-3 text-left font-bold uppercase text-sm">{t.orders.orderNumber}</th>
                      <th className="px-4 py-3 text-left font-bold uppercase text-sm">{t.orders.customer}</th>
                      <th className="px-4 py-3 text-left font-bold uppercase text-sm">{t.orders.date}</th>
                      <th className="px-4 py-3 text-left font-bold uppercase text-sm">{t.orders.status}</th>
                      <th className="px-4 py-3 text-left font-bold uppercase text-sm">{t.orders.paymentStatus}</th>
                      <th className="px-4 py-3 text-left font-bold uppercase text-sm">{t.orders.total}</th>
                      <th className="px-4 py-3 text-right font-bold uppercase text-sm">{t.orders.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockOrders.map((order, index) => (
                      <tr key={order.id} className={`border-t-2 border-[#333333] ${index % 2 === 0 ? "bg-[#0a0a0a]" : "bg-[#111111]"}`}>
                        <td className="px-4 py-4 text-white font-bold">{order.order_number}</td>
                        <td className="px-4 py-4">
                          <p className="text-white">{order.customer}</p>
                          <p className="text-[#888888] text-sm">{order.email}</p>
                        </td>
                        <td className="px-4 py-4 text-[#888888] text-sm">{formatDate(order.created_at)}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-block px-3 py-1 text-xs font-bold uppercase ${getStatusColor(order.status)}`}>
                            {t.orders.statuses[order.status as keyof typeof t.orders.statuses]}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-block px-3 py-1 text-xs font-bold uppercase ${getStatusColor(order.payment_status)}`}>
                            {t.orders.paymentStatuses[order.payment_status as keyof typeof t.orders.paymentStatuses]}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-[#CCFF00] font-bold">{formatPrice(order.final_amount)}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-2 text-[#888888] hover:text-[#CCFF00] transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-[#888888] hover:text-[#CCFF00] transition-colors">
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Inventory Tab */}
          {activeTab === "inventory" && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white uppercase tracking-tighter">
                {t.inventory.title}
              </h2>

              {/* Inventory Table */}
              <div className="border-4 border-[#CCFF00] overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#CCFF00] text-[#0a0a0a]">
                      <th className="px-4 py-3 text-left font-bold uppercase text-sm">{t.inventory.productVariant}</th>
                      <th className="px-4 py-3 text-left font-bold uppercase text-sm">{t.inventory.sku}</th>
                      <th className="px-4 py-3 text-left font-bold uppercase text-sm">{t.inventory.size}</th>
                      <th className="px-4 py-3 text-left font-bold uppercase text-sm">{t.inventory.color}</th>
                      <th className="px-4 py-3 text-left font-bold uppercase text-sm">{t.inventory.stock}</th>
                      <th className="px-4 py-3 text-left font-bold uppercase text-sm">{t.inventory.status}</th>
                      <th className="px-4 py-3 text-right font-bold uppercase text-sm">{t.products.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockInventory.map((item, index) => {
                      const stockStatus = getStockStatus(item.stock_quantity)
                      return (
                        <tr key={item.id} className={`border-t-2 border-[#333333] ${index % 2 === 0 ? "bg-[#0a0a0a]" : "bg-[#111111]"}`}>
                          <td className="px-4 py-4 text-white font-bold">{item.product_name}</td>
                          <td className="px-4 py-4 text-[#888888] font-mono text-sm">{item.sku}</td>
                          <td className="px-4 py-4 text-white">{item.size}</td>
                          <td className="px-4 py-4 text-white">{item.color}</td>
                          <td className="px-4 py-4">
                            <span className={`text-xl font-bold ${stockStatus.color}`}>
                              {item.stock_quantity}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`font-bold uppercase text-sm ${stockStatus.color}`}>
                              {stockStatus.label}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <button className="px-4 py-2 text-[#CCFF00] text-sm font-bold uppercase border-2 border-[#CCFF00] hover:bg-[#CCFF00] hover:text-[#0a0a0a] transition-colors">
                              {t.inventory.updateStock}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Activity Log Tab */}
          {activeTab === "activity" && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white uppercase tracking-tighter">
                {t.activity.title}
              </h2>

              {/* Activity Log */}
              <div className="space-y-4">
                {mockActivityLogs.map((log) => (
                  <div key={log.id} className="border-4 border-[#333333] hover:border-[#CCFF00] transition-colors p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 border-2 ${getActionColor(log.action_type)} border-current`}>
                          {log.action_type === "create" && <Plus className="w-5 h-5" />}
                          {log.action_type === "update" && <Edit2 className="w-5 h-5" />}
                          {log.action_type === "delete" && <Trash2 className="w-5 h-5" />}
                          {log.action_type === "login" && <Users className="w-5 h-5" />}
                          {log.action_type === "logout" && <Users className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-white font-bold">{log.admin_name}</span>
                            <span className={`font-bold uppercase text-sm ${getActionColor(log.action_type)}`}>
                              {t.activity.actionTypes[log.action_type as keyof typeof t.activity.actionTypes]}
                            </span>
                            <span className="text-[#888888] text-sm uppercase">{log.target_table}</span>
                          </div>
                          <p className="text-white">{log.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[#888888] text-sm">{formatDate(log.created_at)}</p>
                        <p className="text-[#666666] text-xs font-mono">{log.ip_address}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
