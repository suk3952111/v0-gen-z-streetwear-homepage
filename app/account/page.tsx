"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useLanguage } from "@/components/providers/language-provider"
import { Header } from "@/components/common/header"
import { Footer } from "@/components/common/footer"
import { AuthModal } from "@/components/shared/auth-modal"
import { 
  User, MapPin, Package, Heart, Settings, LogOut, 
  Plus, Edit2, Trash2, Star, ChevronRight, CheckCircle
} from "lucide-react"

const content = {
  EN: {
    title: "MY",
    titleAccent: "ACCOUNT",
    welcome: "Welcome back,",
    tabs: {
      profile: "PROFILE",
      addresses: "ADDRESSES",
      orders: "ORDERS",
      wishlist: "WISHLIST",
      settings: "SETTINGS",
    },
    profile: {
      title: "PROFILE INFO",
      fullName: "FULL NAME",
      email: "EMAIL",
      phone: "PHONE",
      memberSince: "MEMBER SINCE",
      vibeLevel: "VIBE LEVEL",
      editProfile: "EDIT PROFILE",
      saveChanges: "SAVE CHANGES",
    },
    addresses: {
      title: "SHIPPING ADDRESSES",
      addNew: "ADD NEW ADDRESS",
      default: "DEFAULT",
      setDefault: "SET AS DEFAULT",
      edit: "EDIT",
      delete: "DELETE",
      recipientName: "RECIPIENT NAME",
      phone: "PHONE",
      address: "ADDRESS",
      city: "CITY",
      postalCode: "POSTAL CODE",
      save: "SAVE ADDRESS",
      cancel: "CANCEL",
      noAddresses: "No saved addresses",
      addFirst: "Add your first shipping address",
    },
    orders: {
      title: "ORDER HISTORY",
      orderNumber: "ORDER #",
      date: "DATE",
      status: "STATUS",
      total: "TOTAL",
      items: "ITEMS",
      viewDetails: "VIEW DETAILS",
      noOrders: "No orders yet",
      startShopping: "Start shopping to see your orders here",
      statuses: {
        pending: "PENDING",
        confirmed: "CONFIRMED",
        shipped: "SHIPPED",
        delivered: "DELIVERED",
        cancelled: "CANCELLED",
      }
    },
    logout: "LOGOUT",
  },
  KR: {
    title: "마이",
    titleAccent: "페이지",
    welcome: "환영합니다,",
    tabs: {
      profile: "프로필",
      addresses: "배송지",
      orders: "주문내역",
      wishlist: "위시리스트",
      settings: "설정",
    },
    profile: {
      title: "프로필 정보",
      fullName: "이름",
      email: "이메일",
      phone: "전화번호",
      memberSince: "가입일",
      vibeLevel: "바이브 레벨",
      editProfile: "프로필 수정",
      saveChanges: "변경사항 저장",
    },
    addresses: {
      title: "배송지 관리",
      addNew: "새 배송지 추가",
      default: "기본",
      setDefault: "기본 배송지로 설정",
      edit: "수정",
      delete: "삭제",
      recipientName: "수령인",
      phone: "연락처",
      address: "주소",
      city: "시/도",
      postalCode: "우편번호",
      save: "배송지 저장",
      cancel: "취소",
      noAddresses: "저장된 배송지가 없습니다",
      addFirst: "첫 번째 배송지를 추가해보세요",
    },
    orders: {
      title: "주문 내역",
      orderNumber: "주문번호",
      date: "날짜",
      status: "상태",
      total: "총액",
      items: "상품",
      viewDetails: "상세보기",
      noOrders: "주문 내역이 없습니다",
      startShopping: "쇼핑을 시작하고 주문 내역을 확인하세요",
      statuses: {
        pending: "주문대기",
        confirmed: "주문확인",
        shipped: "배송중",
        delivered: "배송완료",
        cancelled: "취소됨",
      }
    },
    logout: "로그아웃",
  },
}

// Mock user data
const mockUser = {
  id: "user-001",
  email: "vibe_user@vibecheck.com",
  full_name: "CYBER KID",
  phone: "+82 10-1234-5678",
  avatar_url: null,
  is_admin: false,
  is_active: true,
  created_at: "2024-01-01T00:00:00Z",
  last_sign_in_at: "2024-01-20T10:30:00Z",
}

// Mock addresses
const mockAddresses = [
  {
    id: "addr-001",
    recipient_name: "홍길동",
    phone: "010-1234-5678",
    address_line1: "서울특별시 강남구 테헤란로 123",
    address_line2: "바이브 빌딩 5층",
    city: "서울",
    postal_code: "06123",
    is_default: true,
  },
  {
    id: "addr-002",
    recipient_name: "CYBER KID",
    phone: "010-9876-5432",
    address_line1: "서울특별시 홍대입구역 어딘가",
    address_line2: "스트릿웨어 하우스",
    city: "서울",
    postal_code: "04001",
    is_default: false,
  }
]

// Mock orders
const mockOrders = [
  {
    id: "order-001",
    order_number: "VC-2024-001234",
    status: "delivered",
    total_amount: 189,
    final_amount: 189,
    created_at: "2024-01-15T10:30:00Z",
    items: [
      { name: "사이버 후디 3000", quantity: 1, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=100&h=100&fit=crop" }
    ]
  },
  {
    id: "order-002",
    order_number: "VC-2024-001235",
    status: "shipped",
    total_amount: 410,
    final_amount: 410,
    created_at: "2024-01-18T14:20:00Z",
    items: [
      { name: "GLITCH CARGO PANTS", quantity: 2, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=100&h=100&fit=crop" },
      { name: "바이너리 비니", quantity: 1, image: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=100&h=100&fit=crop" }
    ]
  },
  {
    id: "order-003",
    order_number: "VC-2024-001236",
    status: "pending",
    total_amount: 265,
    final_amount: 265,
    created_at: "2024-01-20T09:00:00Z",
    items: [
      { name: "PIXEL VARSITY JACKET", quantity: 1, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=100&h=100&fit=crop" }
    ]
  }
]

type Tab = "profile" | "addresses" | "orders"

export default function AccountPage() {
  const { language, setLanguage } = useLanguage()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>("profile")
  const [addresses, setAddresses] = useState(mockAddresses)
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [editingAddress, setEditingAddress] = useState<string | null>(null)
  
  // Address form state
  const [addressForm, setAddressForm] = useState({
    recipient_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    postal_code: "",
  })

  const t = content[language]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === "KR" ? "ko-KR" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  const formatPrice = (amount: number) => {
    return language === "KR" ? `${(amount * 1000).toLocaleString()}원` : `$${amount}`
  }

  const handleSetDefaultAddress = (id: string) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      is_default: addr.id === id
    })))
  }

  const handleDeleteAddress = (id: string) => {
    setAddresses(prev => prev.filter(addr => addr.id !== id))
  }

  const handleSaveAddress = () => {
    if (editingAddress) {
      setAddresses(prev => prev.map(addr => 
        addr.id === editingAddress ? { ...addr, ...addressForm } : addr
      ))
      setEditingAddress(null)
    } else {
      const newAddress = {
        id: `addr-${Date.now()}`,
        ...addressForm,
        is_default: addresses.length === 0
      }
      setAddresses(prev => [...prev, newAddress])
    }
    setIsAddingAddress(false)
    setAddressForm({
      recipient_name: "",
      phone: "",
      address_line1: "",
      address_line2: "",
      city: "",
      postal_code: "",
    })
  }

  const startEditAddress = (addr: typeof mockAddresses[0]) => {
    setAddressForm({
      recipient_name: addr.recipient_name,
      phone: addr.phone,
      address_line1: addr.address_line1,
      address_line2: addr.address_line2 || "",
      city: addr.city,
      postal_code: addr.postal_code,
    })
    setEditingAddress(addr.id)
    setIsAddingAddress(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered": return "text-[#00FF88]"
      case "shipped": return "text-[#00CCFF]"
      case "confirmed": return "text-[#CCFF00]"
      case "pending": return "text-[#FFCC00]"
      case "cancelled": return "text-[#FF4444]"
      default: return "text-white"
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Header 
        language={language} 
        onLanguageChange={setLanguage} 
        onAuthClick={() => setIsAuthModalOpen(true)}
      />

      <section className="relative pt-24 pb-20 px-4 md:px-8">
        {/* Grainy texture overlay */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12 border-b-4 border-[#CCFF00] pb-6">
            <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tighter leading-none">
              {t.title}
              <span className="text-[#CCFF00]">{t.titleAccent}</span>
            </h1>
            <p className="text-[#888888] uppercase tracking-wider mt-2">
              {t.welcome} <span className="text-[#CCFF00]">{mockUser.full_name}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="border-4 border-[#CCFF00] bg-[#0a0a0a] sticky top-24">
                {/* User Avatar */}
                <div className="p-6 border-b-4 border-[#CCFF00] text-center">
                  <div className="w-24 h-24 mx-auto mb-4 border-4 border-[#CCFF00] bg-[#1a1a1a] flex items-center justify-center">
                    <User className="w-12 h-12 text-[#CCFF00]" />
                  </div>
                  <p className="text-white font-bold text-xl uppercase">{mockUser.full_name}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Star className="w-4 h-4 text-[#CCFF00] fill-[#CCFF00]" />
                    <span className="text-[#CCFF00] text-sm font-bold uppercase">{t.profile.vibeLevel}: GOLD</span>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-2">
                  {[
                    { id: "profile" as Tab, icon: User, label: t.tabs.profile },
                    { id: "addresses" as Tab, icon: MapPin, label: t.tabs.addresses },
                    { id: "orders" as Tab, icon: Package, label: t.tabs.orders },
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
                  
                  <Link
                    href="/wishlist"
                    className="w-full flex items-center gap-3 px-4 py-3 font-bold uppercase tracking-wider text-white hover:bg-[#1a1a1a] hover:text-[#CCFF00] transition-colors"
                  >
                    <Heart className="w-5 h-5" />
                    {t.tabs.wishlist}
                  </Link>

                  <div className="border-t-2 border-[#333333] pt-4 mt-4">
                    <button className="w-full flex items-center gap-3 px-4 py-3 font-bold uppercase tracking-wider text-[#ff4444] hover:bg-[#1a1a1a] transition-colors">
                      <LogOut className="w-5 h-5" />
                      {t.logout}
                    </button>
                  </div>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="border-4 border-[#CCFF00] p-6">
                  <h2 className="text-2xl font-bold text-white uppercase tracking-wider mb-6 pb-4 border-b-2 border-[#333333]">
                    {t.profile.title}
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[#888888] text-sm uppercase tracking-wider mb-2">
                          {t.profile.fullName}
                        </label>
                        <p className="text-white text-xl font-bold uppercase">{mockUser.full_name}</p>
                      </div>
                      <div>
                        <label className="block text-[#888888] text-sm uppercase tracking-wider mb-2">
                          {t.profile.email}
                        </label>
                        <p className="text-white text-xl">{mockUser.email}</p>
                      </div>
                      <div>
                        <label className="block text-[#888888] text-sm uppercase tracking-wider mb-2">
                          {t.profile.phone}
                        </label>
                        <p className="text-white text-xl">{mockUser.phone}</p>
                      </div>
                      <div>
                        <label className="block text-[#888888] text-sm uppercase tracking-wider mb-2">
                          {t.profile.memberSince}
                        </label>
                        <p className="text-white text-xl">{formatDate(mockUser.created_at)}</p>
                      </div>
                    </div>

                    <button className="px-8 py-4 bg-[#CCFF00] text-[#0a0a0a] font-bold uppercase tracking-wider border-4 border-[#CCFF00] hover:bg-[#0a0a0a] hover:text-[#CCFF00] transition-colors">
                      {t.profile.editProfile}
                    </button>
                  </div>
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === "addresses" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white uppercase tracking-wider">
                      {t.addresses.title}
                    </h2>
                    {!isAddingAddress && (
                      <button
                        onClick={() => setIsAddingAddress(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-[#CCFF00] text-[#0a0a0a] font-bold uppercase tracking-wider border-4 border-[#CCFF00] hover:bg-[#0a0a0a] hover:text-[#CCFF00] transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                        {t.addresses.addNew}
                      </button>
                    )}
                  </div>

                  {/* Add/Edit Address Form */}
                  {isAddingAddress && (
                    <div className="border-4 border-[#CCFF00] p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-white text-sm font-bold uppercase tracking-wider mb-2">
                            {t.addresses.recipientName} *
                          </label>
                          <input
                            type="text"
                            value={addressForm.recipient_name}
                            onChange={(e) => setAddressForm(prev => ({ ...prev, recipient_name: e.target.value }))}
                            className="w-full px-4 py-3 bg-[#1a1a1a] border-2 border-[#333333] text-white focus:border-[#CCFF00] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-white text-sm font-bold uppercase tracking-wider mb-2">
                            {t.addresses.phone} *
                          </label>
                          <input
                            type="text"
                            value={addressForm.phone}
                            onChange={(e) => setAddressForm(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full px-4 py-3 bg-[#1a1a1a] border-2 border-[#333333] text-white focus:border-[#CCFF00] focus:outline-none"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-white text-sm font-bold uppercase tracking-wider mb-2">
                            {t.addresses.address} *
                          </label>
                          <input
                            type="text"
                            value={addressForm.address_line1}
                            onChange={(e) => setAddressForm(prev => ({ ...prev, address_line1: e.target.value }))}
                            className="w-full px-4 py-3 bg-[#1a1a1a] border-2 border-[#333333] text-white focus:border-[#CCFF00] focus:outline-none mb-3"
                            placeholder="Address Line 1"
                          />
                          <input
                            type="text"
                            value={addressForm.address_line2}
                            onChange={(e) => setAddressForm(prev => ({ ...prev, address_line2: e.target.value }))}
                            className="w-full px-4 py-3 bg-[#1a1a1a] border-2 border-[#333333] text-white focus:border-[#CCFF00] focus:outline-none"
                            placeholder="Address Line 2 (optional)"
                          />
                        </div>
                        <div>
                          <label className="block text-white text-sm font-bold uppercase tracking-wider mb-2">
                            {t.addresses.city} *
                          </label>
                          <input
                            type="text"
                            value={addressForm.city}
                            onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                            className="w-full px-4 py-3 bg-[#1a1a1a] border-2 border-[#333333] text-white focus:border-[#CCFF00] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-white text-sm font-bold uppercase tracking-wider mb-2">
                            {t.addresses.postalCode} *
                          </label>
                          <input
                            type="text"
                            value={addressForm.postal_code}
                            onChange={(e) => setAddressForm(prev => ({ ...prev, postal_code: e.target.value }))}
                            className="w-full px-4 py-3 bg-[#1a1a1a] border-2 border-[#333333] text-white focus:border-[#CCFF00] focus:outline-none"
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-4 mt-6">
                        <button
                          onClick={handleSaveAddress}
                          className="px-8 py-3 bg-[#CCFF00] text-[#0a0a0a] font-bold uppercase tracking-wider border-4 border-[#CCFF00] hover:bg-[#0a0a0a] hover:text-[#CCFF00] transition-colors"
                        >
                          {t.addresses.save}
                        </button>
                        <button
                          onClick={() => {
                            setIsAddingAddress(false)
                            setEditingAddress(null)
                            setAddressForm({
                              recipient_name: "",
                              phone: "",
                              address_line1: "",
                              address_line2: "",
                              city: "",
                              postal_code: "",
                            })
                          }}
                          className="px-8 py-3 bg-transparent text-[#888888] font-bold uppercase tracking-wider border-4 border-[#333333] hover:border-[#888888] hover:text-white transition-colors"
                        >
                          {t.addresses.cancel}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Address List */}
                  {addresses.length === 0 ? (
                    <div className="text-center py-16 border-4 border-dashed border-[#333333]">
                      <MapPin className="w-16 h-16 text-[#333333] mx-auto mb-4" />
                      <p className="text-[#888888] text-xl uppercase tracking-wider mb-2">{t.addresses.noAddresses}</p>
                      <p className="text-[#666666] text-sm">{t.addresses.addFirst}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {addresses.map((addr) => (
                        <div 
                          key={addr.id} 
                          className={`border-4 p-6 ${addr.is_default ? "border-[#CCFF00]" : "border-[#333333]"}`}
                        >
                          {addr.is_default && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#CCFF00] text-[#0a0a0a] text-xs font-bold uppercase mb-4">
                              <CheckCircle className="w-3 h-3" />
                              {t.addresses.default}
                            </span>
                          )}
                          
                          <p className="text-white font-bold text-lg mb-1">{addr.recipient_name}</p>
                          <p className="text-[#888888] mb-2">{addr.phone}</p>
                          <p className="text-white">{addr.address_line1}</p>
                          {addr.address_line2 && <p className="text-white">{addr.address_line2}</p>}
                          <p className="text-white">{addr.city}, {addr.postal_code}</p>

                          <div className="flex gap-3 mt-4 pt-4 border-t-2 border-[#333333]">
                            {!addr.is_default && (
                              <button
                                onClick={() => handleSetDefaultAddress(addr.id)}
                                className="text-[#CCFF00] text-sm font-bold uppercase hover:underline"
                              >
                                {t.addresses.setDefault}
                              </button>
                            )}
                            <button
                              onClick={() => startEditAddress(addr)}
                              className="flex items-center gap-1 text-[#888888] text-sm font-bold uppercase hover:text-white"
                            >
                              <Edit2 className="w-4 h-4" />
                              {t.addresses.edit}
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="flex items-center gap-1 text-[#ff4444] text-sm font-bold uppercase hover:text-white"
                            >
                              <Trash2 className="w-4 h-4" />
                              {t.addresses.delete}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === "orders" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white uppercase tracking-wider">
                    {t.orders.title}
                  </h2>

                  {mockOrders.length === 0 ? (
                    <div className="text-center py-16 border-4 border-dashed border-[#333333]">
                      <Package className="w-16 h-16 text-[#333333] mx-auto mb-4" />
                      <p className="text-[#888888] text-xl uppercase tracking-wider mb-2">{t.orders.noOrders}</p>
                      <p className="text-[#666666] text-sm">{t.orders.startShopping}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {mockOrders.map((order) => (
                        <div key={order.id} className="border-4 border-[#333333] hover:border-[#CCFF00] transition-colors">
                          {/* Order Header */}
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border-b-2 border-[#333333]">
                            <div className="flex items-center gap-6">
                              <div>
                                <p className="text-[#888888] text-xs uppercase">{t.orders.orderNumber}</p>
                                <p className="text-white font-bold">{order.order_number}</p>
                              </div>
                              <div>
                                <p className="text-[#888888] text-xs uppercase">{t.orders.date}</p>
                                <p className="text-white">{formatDate(order.created_at)}</p>
                              </div>
                              <div>
                                <p className="text-[#888888] text-xs uppercase">{t.orders.status}</p>
                                <p className={`font-bold uppercase ${getStatusColor(order.status)}`}>
                                  {t.orders.statuses[order.status as keyof typeof t.orders.statuses]}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[#888888] text-xs uppercase">{t.orders.total}</p>
                              <p className="text-[#CCFF00] text-xl font-bold">{formatPrice(order.final_amount)}</p>
                            </div>
                          </div>

                          {/* Order Items */}
                          <div className="p-4">
                            <p className="text-[#888888] text-xs uppercase mb-3">{t.orders.items}</p>
                            <div className="flex flex-wrap gap-4">
                              {order.items.map((item, index) => (
                                <div key={index} className="flex items-center gap-3">
                                  <div className="relative w-16 h-16 border-2 border-[#333333]">
                                    <Image
                                      src={item.image || "/placeholder.svg"}
                                      alt={item.name}
                                      fill
                                      className="object-cover"
                                    />
                                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#CCFF00] text-[#0a0a0a] text-xs font-bold flex items-center justify-center">
                                      {item.quantity}
                                    </span>
                                  </div>
                                  <p className="text-white text-sm font-bold uppercase max-w-[150px] truncate">{item.name}</p>
                                </div>
                              ))}
                            </div>
                            
                            <button className="flex items-center gap-2 text-[#CCFF00] text-sm font-bold uppercase mt-4 hover:underline">
                              {t.orders.viewDetails}
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer language={language} />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        language={language}
      />
    </main>
  )
}
