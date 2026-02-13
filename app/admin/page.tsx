"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { useLanguage } from "@/components/providers/language-provider"
import { 
  LayoutDashboard, Package, ShoppingCart, Settings, Activity,
  TrendingUp, AlertTriangle, Search,
  Edit2, Eye, Trash2, RefreshCw,
  Plus, Clock, X, Upload, ChevronDown
} from "lucide-react"

// ─── Localized Content ───────────────────────────────────────────
const content = {
  EN: {
    brand: "VIBE CHECK",
    brandSub: "ADMIN",
    nav: {
      dashboard: "DASHBOARD",
      products: "PRODUCTS",
      orders: "ORDERS",
      settings: "SETTINGS",
    },
    stats: {
      totalSales: "TOTAL SALES",
      totalOrders: "TOTAL ORDERS",
      pendingOrders: "PENDING",
      lowStock: "LOW STOCK ALERTS",
    },
    products: {
      title: "PRODUCT INVENTORY",
      search: "SEARCH PRODUCTS...",
      addProduct: "ADD NEW PRODUCT",
      image: "IMAGE",
      name: "NAME",
      category: "CATEGORY",
      price: "PRICE",
      stock: "STOCK",
      status: "STATUS",
      actions: "ACTIONS",
      active: "ACTIVE",
      draft: "DRAFT",
      edit: "EDIT",
      delete: "DELETE",
      showing: "Showing",
      of: "of",
      products_label: "products",
    },
    orders: {
      title: "ORDER MANAGEMENT",
      search: "SEARCH ORDERS...",
      orderNumber: "ORDER #",
      customer: "CUSTOMER",
      date: "DATE",
      status: "STATUS",
      total: "TOTAL",
      paymentStatus: "PAYMENT",
      actions: "ACTIONS",
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
      },
    },
    modal: {
      title: "ADD NEW PRODUCT",
      productName: "PRODUCT NAME",
      namePlaceholder: "ENTER PRODUCT NAME...",
      price: "PRICE (KRW)",
      pricePlaceholder: "0",
      stock: "STOCK QUANTITY",
      stockPlaceholder: "0",
      category: "CATEGORY",
      selectCategory: "SELECT CATEGORY",
      description: "DESCRIPTION",
      descPlaceholder: "ENTER PRODUCT DESCRIPTION...",
      imageUpload: "PRODUCT IMAGE",
      imageHint: "DRAG & DROP OR CLICK TO UPLOAD",
      imageFormats: "JPG, PNG, WEBP SUPPORTED",
      cancel: "CANCEL",
      save: "SAVE PRODUCT",
    },
    refresh: "REFRESH",
    sidebarPending: "PENDING ORDERS",
    sidebarLowStock: "LOW STOCK",
    adminOnline: "ADMIN ONLINE",
  },
  KR: {
    brand: "VIBE CHECK",
    brandSub: "관리자",
    nav: {
      dashboard: "대시보드",
      products: "상품 관리",
      orders: "주문 관리",
      settings: "설정",
    },
    stats: {
      totalSales: "총 매출",
      totalOrders: "총 주문",
      pendingOrders: "처리 대기",
      lowStock: "재고 부족 알림",
    },
    products: {
      title: "상품 재고 관리",
      search: "상품 검색...",
      addProduct: "새 상품 추가",
      image: "이미지",
      name: "상품명",
      category: "카테고리",
      price: "가격",
      stock: "재고",
      status: "상태",
      actions: "관리",
      active: "공개",
      draft: "비공개",
      edit: "수정",
      delete: "삭제",
      showing: "표시",
      of: "/",
      products_label: "개 상품",
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
      },
    },
    modal: {
      title: "새 상품 추가",
      productName: "상품명",
      namePlaceholder: "상품명 입력...",
      price: "가격 (원)",
      pricePlaceholder: "0",
      stock: "재고 수량",
      stockPlaceholder: "0",
      category: "카테고리",
      selectCategory: "카테고리 선택",
      description: "상품 설명",
      descPlaceholder: "상품 설명 입력...",
      imageUpload: "상품 이미지",
      imageHint: "드래그 앤 드롭 또는 클릭하여 업로드",
      imageFormats: "JPG, PNG, WEBP 지원",
      cancel: "취소",
      save: "상품 저장",
    },
    refresh: "새로고침",
    sidebarPending: "대기 주문",
    sidebarLowStock: "재고 부족",
    adminOnline: "관리자 온라인",
  },
}

// ─── Mock Data ───────────────────────────────────────────────────
const mockStats = {
  totalSales: 12450000,
  totalOrders: 156,
  pendingOrders: 12,
  lowStockItems: 8,
}

const mockProducts = [
  { id: "hoodie-001", name: "사이버 후디 3000", sku: "VB-HD-001", category: "HOODIES", stock_quantity: 45, base_price: 189000, is_published: true, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=100&h=100&fit=crop" },
  { id: "hoodie-002", name: "PHANTOM ZIP-UP", sku: "VB-HD-002", category: "HOODIES", stock_quantity: 8, base_price: 215000, is_published: true, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=100&h=100&fit=crop" },
  { id: "pants-001", name: "GLITCH CARGO PANTS", sku: "VB-PT-001", category: "BOTTOMS", stock_quantity: 0, base_price: 145000, is_published: true, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=100&h=100&fit=crop" },
  { id: "jacket-001", name: "PIXEL VARSITY JACKET", sku: "VB-JK-001", category: "OUTER", stock_quantity: 23, base_price: 265000, is_published: false, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=100&h=100&fit=crop" },
  { id: "acc-001", name: "바이너리 비니", sku: "VB-AC-001", category: "ACC", stock_quantity: 67, base_price: 45000, is_published: true, image: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=100&h=100&fit=crop" },
  { id: "hoodie-003", name: "데이터 스트림 후디", sku: "VB-HD-003", category: "HOODIES", stock_quantity: 3, base_price: 175000, is_published: true, image: "https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=100&h=100&fit=crop" },
  { id: "top-001", name: "NEON OVERSIZED TEE", sku: "VB-TP-001", category: "TOPS", stock_quantity: 31, base_price: 79000, is_published: true, image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=100&h=100&fit=crop" },
]

const mockOrders = [
  { id: "order-001", order_number: "VC-2024-001234", customer: "홍길동", email: "hong@email.com", status: "pending", payment_status: "completed", final_amount: 189000, created_at: "2024-01-20T09:00:00Z" },
  { id: "order-002", order_number: "VC-2024-001235", customer: "CYBER_KID", email: "cyber@email.com", status: "shipped", payment_status: "completed", final_amount: 410000, created_at: "2024-01-19T14:30:00Z" },
  { id: "order-003", order_number: "VC-2024-001236", customer: "스트릿워리어", email: "street@email.com", status: "delivered", payment_status: "completed", final_amount: 265000, created_at: "2024-01-18T11:20:00Z" },
  { id: "order-004", order_number: "VC-2024-001237", customer: "TECHWEAR_FAN", email: "tech@email.com", status: "cancelled", payment_status: "refunded", final_amount: 145000, created_at: "2024-01-17T16:45:00Z" },
]

const categoryOptions = ["HOODIES", "OUTER", "TOPS", "BOTTOMS", "ACC"]

type Tab = "dashboard" | "products" | "orders" | "settings"

export default function AdminPage() {
  const { language } = useLanguage()
  const [activeTab, setActiveTab] = useState<Tab>("products")
  const [searchQuery, setSearchQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)

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
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
      case "completed":
        return "bg-[#00FF88] text-[#0a0a0a]"
      case "shipped":
        return "bg-[#00CCFF] text-[#0a0a0a]"
      case "confirmed":
      case "pending":
        return "bg-[#FFCC00] text-[#0a0a0a]"
      case "cancelled":
      case "failed":
      case "refunded":
        return "bg-[#FF4444] text-white"
      default:
        return "bg-[#333333] text-white"
    }
  }

  const getStockColor = (qty: number) => {
    if (qty === 0) return "text-[#FF4444]"
    if (qty <= 10) return "text-[#FFCC00]"
    return "text-[#00FF88]"
  }

  const filteredProducts = mockProducts.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => setUploadedImage(ev.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  // Sidebar navigation items
  const navItems = [
    { id: "dashboard" as Tab, icon: LayoutDashboard, label: t.nav.dashboard },
    { id: "products" as Tab, icon: Package, label: t.nav.products },
    { id: "orders" as Tab, icon: ShoppingCart, label: t.nav.orders },
    { id: "settings" as Tab, icon: Settings, label: t.nav.settings },
  ]

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* ═══ Admin Header ═══ */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b-4 border-[#CCFF00] bg-[#0a0a0a]">
        <div className="flex items-center justify-between px-4 py-4 md:px-8">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-[#CCFF00] tracking-tighter">
              {t.brand} <span className="text-white">{t.brandSub}</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 border-2 border-[#333333]">
              <div className="w-3 h-3 bg-[#00FF88] rounded-full animate-pulse" />
              <span className="text-[#888888] text-sm font-bold uppercase tracking-wider">{t.adminOnline}</span>
            </div>
            <button className="p-2 border-2 border-[#CCFF00] text-[#CCFF00] hover:bg-[#CCFF00] hover:text-[#0a0a0a] transition-colors">
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex pt-[72px]">
        {/* ═══ Sidebar Navigation ═══ */}
        <aside className="fixed left-0 top-[72px] bottom-0 w-64 border-r-4 border-[#CCFF00] bg-[#0a0a0a] hidden lg:flex flex-col">
          {/* Branding Area */}
          <div className="p-6 border-b-2 border-[#1a1a1a]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border-4 border-[#CCFF00] flex items-center justify-center">
                <Package className="w-5 h-5 text-[#CCFF00]" />
              </div>
              <div>
                <p className="text-white font-bold text-sm uppercase tracking-wider">Control Panel</p>
                <p className="text-[#888888] text-xs uppercase tracking-wider">v2.0.1</p>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 p-4">
            <div className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 font-bold uppercase tracking-wider transition-all text-sm ${
                    activeTab === item.id
                      ? "bg-[#CCFF00] text-[#0a0a0a] shadow-[0_0_15px_rgba(204,255,0,0.3)]"
                      : "text-white border-2 border-transparent hover:border-[#CCFF00] hover:text-[#CCFF00]"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  [{item.label}]
                </button>
              ))}
            </div>
          </nav>

          {/* Sidebar Stats */}
          <div className="p-4 border-t-4 border-[#333333]">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[#888888] text-xs font-bold uppercase tracking-wider">{t.sidebarPending}</span>
                <span className="text-[#FFCC00] font-bold text-lg">{mockStats.pendingOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#888888] text-xs font-bold uppercase tracking-wider">{t.sidebarLowStock}</span>
                <span className="text-[#FF4444] font-bold text-lg">{mockStats.lowStockItems}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ═══ Mobile Tab Bar ═══ */}
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t-4 border-[#CCFF00] bg-[#0a0a0a] lg:hidden">
          <div className="flex justify-around p-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`p-3 transition-colors ${
                  activeTab === item.id ? "text-[#CCFF00]" : "text-[#888888] hover:text-white"
                }`}
              >
                <item.icon className="w-6 h-6" />
              </button>
            ))}
          </div>
        </div>

        {/* ═══ Main Content Area ═══ */}
        <div className="flex-1 lg:ml-64 p-4 md:p-8 pb-24 lg:pb-8">

          {/* ──── Dashboard Tab ──── */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold text-white uppercase tracking-tighter">
                {t.nav.dashboard}
              </h2>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="border-4 border-[#CCFF00] p-6 hover:shadow-[0_0_20px_rgba(204,255,0,0.2)] transition-shadow">
                  <TrendingUp className="w-8 h-8 text-[#00FF88] mb-4" />
                  <p className="text-[#888888] text-xs font-bold uppercase tracking-[0.3em] mb-1">{t.stats.totalSales}</p>
                  <p className="text-3xl font-bold text-white">{formatPrice(mockStats.totalSales)}</p>
                </div>
                <div className="border-4 border-[#CCFF00] p-6 hover:shadow-[0_0_20px_rgba(204,255,0,0.2)] transition-shadow">
                  <ShoppingCart className="w-8 h-8 text-[#CCFF00] mb-4" />
                  <p className="text-[#888888] text-xs font-bold uppercase tracking-[0.3em] mb-1">{t.stats.totalOrders}</p>
                  <p className="text-3xl font-bold text-white">{mockStats.totalOrders}</p>
                </div>
                <div className="border-4 border-[#FFCC00] p-6 hover:shadow-[0_0_20px_rgba(255,204,0,0.2)] transition-shadow">
                  <Clock className="w-8 h-8 text-[#FFCC00] mb-4" />
                  <p className="text-[#888888] text-xs font-bold uppercase tracking-[0.3em] mb-1">{t.stats.pendingOrders}</p>
                  <p className="text-3xl font-bold text-[#FFCC00]">{mockStats.pendingOrders}</p>
                </div>
                <div className="border-4 border-[#FF4444] p-6 hover:shadow-[0_0_20px_rgba(255,68,68,0.2)] transition-shadow">
                  <AlertTriangle className="w-8 h-8 text-[#FF4444] mb-4" />
                  <p className="text-[#888888] text-xs font-bold uppercase tracking-[0.3em] mb-1">{t.stats.lowStock}</p>
                  <p className="text-3xl font-bold text-[#FF4444]">{mockStats.lowStockItems}</p>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="border-4 border-[#CCFF00] p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white uppercase tracking-wider">{t.orders.title}</h3>
                  <button onClick={() => setActiveTab("orders")} className="text-[#CCFF00] text-sm font-bold uppercase hover:underline tracking-wider">
                    {"View All →"}
                  </button>
                </div>
                <div className="space-y-3">
                  {mockOrders.slice(0, 3).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-[#111111] border-2 border-[#222222] hover:border-[#CCFF00] transition-colors">
                      <div>
                        <p className="text-white font-bold tracking-wider">{order.order_number}</p>
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
            </div>
          )}

          {/* ──── Products Tab (Primary Focus) ──── */}
          {activeTab === "products" && (
            <div className="space-y-6">
              {/* Page Title */}
              <h2 className="text-4xl md:text-5xl font-bold text-white uppercase tracking-tighter">
                {t.products.title}
              </h2>

              {/* Action Bar */}
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[#CCFF00]" />
                  <input
                    type="text"
                    placeholder={t.products.search}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-14 pr-12 py-4 bg-[#0a0a0a] border-4 border-[#CCFF00] text-white font-mono text-base uppercase tracking-wider placeholder:text-[#888888] focus:outline-none focus:shadow-[0_0_20px_#CCFF00] transition-shadow"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#CCFF00] hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Add New Product Button */}
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-3 px-8 py-4 bg-[#CCFF00] text-[#0a0a0a] font-bold uppercase tracking-wider border-4 border-[#CCFF00] hover:bg-[#0a0a0a] hover:text-[#CCFF00] hover:shadow-[0_0_20px_#CCFF00] transition-all whitespace-nowrap"
                >
                  <Plus className="w-6 h-6" />
                  {t.products.addProduct}
                </button>
              </div>

              {/* Result Count */}
              <p className="text-[#888888] text-sm font-bold uppercase tracking-wider">
                {t.products.showing} {filteredProducts.length} {t.products.of} {mockProducts.length} {t.products.products_label}
              </p>

              {/* ─── Data Table ─── */}
              <div className="border-4 border-[#CCFF00] overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b-4 border-[#CCFF00]">
                      <th className="px-4 py-4 text-left text-[#CCFF00] font-bold uppercase text-xs tracking-[0.3em]">{t.products.image}</th>
                      <th className="px-4 py-4 text-left text-[#CCFF00] font-bold uppercase text-xs tracking-[0.3em]">{t.products.name}</th>
                      <th className="px-4 py-4 text-left text-[#CCFF00] font-bold uppercase text-xs tracking-[0.3em]">{t.products.category}</th>
                      <th className="px-4 py-4 text-left text-[#CCFF00] font-bold uppercase text-xs tracking-[0.3em]">{t.products.price}</th>
                      <th className="px-4 py-4 text-left text-[#CCFF00] font-bold uppercase text-xs tracking-[0.3em]">{t.products.stock}</th>
                      <th className="px-4 py-4 text-left text-[#CCFF00] font-bold uppercase text-xs tracking-[0.3em]">{t.products.status}</th>
                      <th className="px-4 py-4 text-right text-[#CCFF00] font-bold uppercase text-xs tracking-[0.3em]">{t.products.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="border-t-2 border-[#1a1a1a] bg-[#0a0a0a] hover:bg-[#111111] hover:shadow-[inset_0_0_30px_rgba(204,255,0,0.05)] transition-all group"
                      >
                        {/* Image */}
                        <td className="px-4 py-4">
                          <div className="relative w-14 h-14 border-2 border-[#333333] group-hover:border-[#CCFF00] transition-colors overflow-hidden">
                            <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                          </div>
                        </td>
                        {/* Name + SKU */}
                        <td className="px-4 py-4">
                          <p className="text-white font-bold uppercase tracking-wider">{product.name}</p>
                          <p className="text-[#888888] font-mono text-xs mt-1">{product.sku}</p>
                        </td>
                        {/* Category */}
                        <td className="px-4 py-4">
                          <span className="px-3 py-1 border-2 border-[#333333] text-[#888888] text-xs font-bold uppercase tracking-wider group-hover:border-[#CCFF00] group-hover:text-[#CCFF00] transition-colors">
                            {product.category}
                          </span>
                        </td>
                        {/* Price */}
                        <td className="px-4 py-4 text-[#CCFF00] font-bold text-lg">{formatPrice(product.base_price)}</td>
                        {/* Stock */}
                        <td className="px-4 py-4">
                          <span className={`text-lg font-bold ${getStockColor(product.stock_quantity)}`}>
                            {product.stock_quantity}
                          </span>
                        </td>
                        {/* Status */}
                        <td className="px-4 py-4">
                          {product.is_published ? (
                            <span className="px-3 py-1 border-2 border-[#CCFF00] text-[#CCFF00] text-xs font-bold uppercase tracking-wider">
                              {t.products.active}
                            </span>
                          ) : (
                            <span className="px-3 py-1 border-2 border-[#888888] text-[#888888] text-xs font-bold uppercase tracking-wider">
                              {t.products.draft}
                            </span>
                          )}
                        </td>
                        {/* Actions */}
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              className="p-2 border-2 border-[#333333] text-[#888888] hover:border-[#CCFF00] hover:text-[#CCFF00] hover:shadow-[0_0_10px_rgba(204,255,0,0.3)] transition-all"
                              title={t.products.edit}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(deleteConfirmId === product.id ? null : product.id)}
                              className={`p-2 border-2 transition-all ${
                                deleteConfirmId === product.id
                                  ? "border-[#FF4444] text-[#FF4444] bg-[#FF4444]/10 shadow-[0_0_15px_rgba(255,68,68,0.4)] animate-pulse"
                                  : "border-[#333333] text-[#888888] hover:border-[#FF4444] hover:text-[#FF4444] hover:shadow-[0_0_10px_rgba(255,68,68,0.3)]"
                              }`}
                              title={t.products.delete}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          {/* Delete Confirmation Inline */}
                          {deleteConfirmId === product.id && (
                            <div className="mt-2 flex items-center justify-end gap-2">
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-3 py-1 text-xs font-bold uppercase text-[#888888] border-2 border-[#333333] hover:border-white hover:text-white transition-colors"
                              >
                                {t.modal.cancel}
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-3 py-1 text-xs font-bold uppercase bg-[#FF4444] text-white border-2 border-[#FF4444] hover:bg-[#FF6666] transition-colors"
                              >
                                {t.products.delete}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ──── Orders Tab ──── */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-white uppercase tracking-tighter">
                {t.orders.title}
              </h2>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[#CCFF00]" />
                <input
                  type="text"
                  placeholder={t.orders.search}
                  className="w-full pl-14 pr-4 py-4 bg-[#0a0a0a] border-4 border-[#CCFF00] text-white font-mono text-base uppercase tracking-wider placeholder:text-[#888888] focus:outline-none focus:shadow-[0_0_20px_#CCFF00] transition-shadow"
                />
              </div>

              {/* Orders Table */}
              <div className="border-4 border-[#CCFF00] overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b-4 border-[#CCFF00]">
                      <th className="px-4 py-4 text-left text-[#CCFF00] font-bold uppercase text-xs tracking-[0.3em]">{t.orders.orderNumber}</th>
                      <th className="px-4 py-4 text-left text-[#CCFF00] font-bold uppercase text-xs tracking-[0.3em]">{t.orders.customer}</th>
                      <th className="px-4 py-4 text-left text-[#CCFF00] font-bold uppercase text-xs tracking-[0.3em]">{t.orders.date}</th>
                      <th className="px-4 py-4 text-left text-[#CCFF00] font-bold uppercase text-xs tracking-[0.3em]">{t.orders.status}</th>
                      <th className="px-4 py-4 text-left text-[#CCFF00] font-bold uppercase text-xs tracking-[0.3em]">{t.orders.paymentStatus}</th>
                      <th className="px-4 py-4 text-left text-[#CCFF00] font-bold uppercase text-xs tracking-[0.3em]">{t.orders.total}</th>
                      <th className="px-4 py-4 text-right text-[#CCFF00] font-bold uppercase text-xs tracking-[0.3em]">{t.orders.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockOrders.map((order) => (
                      <tr key={order.id} className="border-t-2 border-[#1a1a1a] bg-[#0a0a0a] hover:bg-[#111111] hover:shadow-[inset_0_0_30px_rgba(204,255,0,0.05)] transition-all group">
                        <td className="px-4 py-4 text-white font-bold tracking-wider">{order.order_number}</td>
                        <td className="px-4 py-4">
                          <p className="text-white font-bold">{order.customer}</p>
                          <p className="text-[#888888] text-xs font-mono">{order.email}</p>
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
                        <td className="px-4 py-4 text-[#CCFF00] font-bold text-lg">{formatPrice(order.final_amount)}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-2 border-2 border-[#333333] text-[#888888] hover:border-[#CCFF00] hover:text-[#CCFF00] transition-all">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 border-2 border-[#333333] text-[#888888] hover:border-[#CCFF00] hover:text-[#CCFF00] transition-all">
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

          {/* ──── Settings Tab ──── */}
          {activeTab === "settings" && (
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold text-white uppercase tracking-tighter">
                {t.nav.settings}
              </h2>
              <div className="border-4 border-[#333333] p-12 flex flex-col items-center justify-center gap-4">
                <Settings className="w-16 h-16 text-[#333333]" />
                <p className="text-[#888888] font-bold uppercase tracking-wider">Settings Panel Coming Soon</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ Add New Product Modal ═══ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => {
              setIsModalOpen(false)
              setUploadedImage(null)
            }}
          />

          {/* Modal */}
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border-4 border-[#CCFF00] shadow-[0_0_40px_rgba(204,255,0,0.2)]">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b-4 border-[#CCFF00] bg-[#0a0a0a]">
              <h3 className="text-2xl font-bold text-white uppercase tracking-tighter">
                {t.modal.title}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  setUploadedImage(null)
                }}
                className="p-2 border-2 border-[#CCFF00] text-[#CCFF00] hover:bg-[#CCFF00] hover:text-[#0a0a0a] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Product Name */}
              <div>
                <label className="block text-[#CCFF00] text-xs font-bold uppercase tracking-[0.3em] mb-2">
                  {t.modal.productName}
                </label>
                <input
                  type="text"
                  placeholder={t.modal.namePlaceholder}
                  className="w-full px-4 py-4 bg-[#0a0a0a] border-4 border-[#CCFF00] text-white font-mono text-base uppercase tracking-wider placeholder:text-[#888888] focus:outline-none focus:shadow-[0_0_20px_#CCFF00] transition-shadow"
                />
              </div>

              {/* Price + Stock Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#CCFF00] text-xs font-bold uppercase tracking-[0.3em] mb-2">
                    {t.modal.price}
                  </label>
                  <input
                    type="number"
                    placeholder={t.modal.pricePlaceholder}
                    className="w-full px-4 py-4 bg-[#0a0a0a] border-4 border-[#CCFF00] text-white font-mono text-base uppercase tracking-wider placeholder:text-[#888888] focus:outline-none focus:shadow-[0_0_20px_#CCFF00] transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-[#CCFF00] text-xs font-bold uppercase tracking-[0.3em] mb-2">
                    {t.modal.stock}
                  </label>
                  <input
                    type="number"
                    placeholder={t.modal.stockPlaceholder}
                    className="w-full px-4 py-4 bg-[#0a0a0a] border-4 border-[#CCFF00] text-white font-mono text-base uppercase tracking-wider placeholder:text-[#888888] focus:outline-none focus:shadow-[0_0_20px_#CCFF00] transition-shadow"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-[#CCFF00] text-xs font-bold uppercase tracking-[0.3em] mb-2">
                  {t.modal.category}
                </label>
                <div className="relative">
                  <select className="w-full px-4 py-4 bg-[#0a0a0a] border-4 border-[#CCFF00] text-white font-mono text-base uppercase tracking-wider appearance-none focus:outline-none focus:shadow-[0_0_20px_#CCFF00] transition-shadow cursor-pointer">
                    <option value="" className="bg-[#0a0a0a]">{t.modal.selectCategory}</option>
                    {categoryOptions.map((cat) => (
                      <option key={cat} value={cat} className="bg-[#0a0a0a]">{cat}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#CCFF00] pointer-events-none" />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[#CCFF00] text-xs font-bold uppercase tracking-[0.3em] mb-2">
                  {t.modal.description}
                </label>
                <textarea
                  rows={4}
                  placeholder={t.modal.descPlaceholder}
                  className="w-full px-4 py-4 bg-[#0a0a0a] border-4 border-[#CCFF00] text-white font-mono text-base tracking-wider placeholder:text-[#888888] focus:outline-none focus:shadow-[0_0_20px_#CCFF00] transition-shadow resize-none"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-[#CCFF00] text-xs font-bold uppercase tracking-[0.3em] mb-2">
                  {t.modal.imageUpload}
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-4 border-dashed border-[#CCFF00] p-8 flex flex-col items-center justify-center gap-3 hover:bg-[#CCFF00]/5 hover:shadow-[0_0_20px_rgba(204,255,0,0.1)] transition-all cursor-pointer"
                >
                  {uploadedImage ? (
                    <div className="relative w-32 h-32 border-2 border-[#CCFF00]">
                      <Image src={uploadedImage} alt="Upload preview" fill className="object-cover" />
                    </div>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-[#CCFF00]" />
                      <p className="text-white font-bold uppercase tracking-wider text-sm">{t.modal.imageHint}</p>
                      <p className="text-[#888888] text-xs uppercase tracking-wider">{t.modal.imageFormats}</p>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 flex items-center justify-end gap-4 p-6 border-t-4 border-[#CCFF00] bg-[#0a0a0a]">
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  setUploadedImage(null)
                }}
                className="px-8 py-3 border-4 border-[#CCFF00] text-[#CCFF00] font-bold uppercase tracking-wider hover:bg-[#CCFF00]/10 transition-colors"
              >
                {t.modal.cancel}
              </button>
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  setUploadedImage(null)
                }}
                className="px-8 py-3 bg-[#CCFF00] border-4 border-[#CCFF00] text-[#0a0a0a] font-bold uppercase tracking-wider hover:shadow-[0_0_30px_rgba(204,255,0,0.5)] transition-all"
              >
                {t.modal.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
