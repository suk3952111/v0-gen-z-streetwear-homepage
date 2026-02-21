"use client"

import { useState } from "react"
import Link from "next/link"
import { useLanguage } from "@/components/providers/language-provider"
import { AuthModal } from "@/features/users/components/auth-modal"
import { mockAddresses, mockOrders, mockUser } from "@/mocks/account"
import {
  User,
  MapPin,
  Package,
  Heart,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Star,
  ChevronRight,
  CheckCircle,
} from "lucide-react"

const content = {
  EN: {
    title: "MY",
    titleAccent: "ACCOUNT",
    welcome: "Welcome back,",
    tabs: { profile: "PROFILE", addresses: "ADDRESSES", orders: "ORDERS", wishlist: "WISHLIST", settings: "SETTINGS" },
    profile: { title: "PROFILE INFO", fullName: "FULL NAME", email: "EMAIL", phone: "PHONE", memberSince: "MEMBER SINCE", vibeLevel: "VIBE LEVEL", editProfile: "EDIT PROFILE", saveChanges: "SAVE CHANGES" },
    addresses: { title: "SHIPPING ADDRESSES", addNew: "ADD NEW ADDRESS", default: "DEFAULT", setDefault: "SET AS DEFAULT", edit: "EDIT", delete: "DELETE", recipientName: "RECIPIENT NAME", phone: "PHONE", address: "ADDRESS", city: "CITY", postalCode: "POSTAL CODE", save: "SAVE ADDRESS", cancel: "CANCEL", noAddresses: "No saved addresses", addFirst: "Add your first shipping address" },
    orders: { title: "ORDER HISTORY", orderNumber: "ORDER #", date: "DATE", status: "STATUS", total: "TOTAL", items: "ITEMS", viewDetails: "VIEW DETAILS", noOrders: "No orders yet", startShopping: "Start shopping to see your orders here", statuses: { pending: "PENDING", confirmed: "CONFIRMED", shipped: "SHIPPED", delivered: "DELIVERED", cancelled: "CANCELLED" } },
    logout: "LOGOUT",
  },
  KR: {
    title: "마이",
    titleAccent: "페이지",
    welcome: "환영합니다,",
    tabs: { profile: "프로필", addresses: "배송지", orders: "주문내역", wishlist: "위시리스트", settings: "설정" },
    profile: { title: "프로필 정보", fullName: "이름", email: "이메일", phone: "전화번호", memberSince: "가입일", vibeLevel: "바이브 레벨", editProfile: "프로필 수정", saveChanges: "변경사항 저장" },
    addresses: { title: "배송지 관리", addNew: "새 배송지 추가", default: "기본", setDefault: "기본 배송지로 설정", edit: "수정", delete: "삭제", recipientName: "수령인", phone: "연락처", address: "주소", city: "도시", postalCode: "우편번호", save: "배송지 저장", cancel: "취소", noAddresses: "저장된 배송지가 없습니다", addFirst: "첫 번째 배송지를 추가해보세요" },
    orders: { title: "주문 내역", orderNumber: "주문번호", date: "날짜", status: "상태", total: "총액", items: "상품", viewDetails: "상세보기", noOrders: "주문 내역이 없습니다", startShopping: "쇼핑을 시작하고 주문 내역을 확인하세요", statuses: { pending: "주문대기", confirmed: "주문확인", shipped: "배송중", delivered: "배송완료", cancelled: "취소됨" } },
    logout: "로그아웃",
  },
}

type Tab = "profile" | "addresses" | "orders"

export function AccountView() {
  const { language } = useLanguage()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>("profile")
  const [addresses, setAddresses] = useState(mockAddresses)
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [editingAddress, setEditingAddress] = useState<string | null>(null)
  const [addressForm, setAddressForm] = useState({ recipient_name: "", phone: "", address_line1: "", address_line2: "", city: "", postal_code: "" })

  const t = language === "KR" ? content.KR : content.EN

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === "KR" ? "ko-KR" : "en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  const formatPrice = (amount: number) => {
    return language === "KR" ? `${(amount * 1000).toLocaleString()}원` : `$${amount}`
  }

  const handleSetDefaultAddress = (id: string) => {
    setAddresses((prev) => prev.map((addr) => ({ ...addr, is_default: addr.id === id })))
  }

  const handleDeleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((addr) => addr.id !== id))
  }

  const handleSaveAddress = () => {
    if (editingAddress) {
      setAddresses((prev) => prev.map((addr) => addr.id === editingAddress ? { ...addr, ...addressForm } : addr))
      setEditingAddress(null)
    } else {
      setAddresses((prev) => [...prev, { id: `addr-${Date.now()}`, ...addressForm, is_default: addresses.length === 0 }])
    }
    setIsAddingAddress(false)
    setAddressForm({ recipient_name: "", phone: "", address_line1: "", address_line2: "", city: "", postal_code: "" })
  }

  const startEditAddress = (addr: (typeof mockAddresses)[0]) => {
    setAddressForm({ recipient_name: addr.recipient_name, phone: addr.phone, address_line1: addr.address_line1, address_line2: addr.address_line2 || "", city: addr.city, postal_code: addr.postal_code })
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
      <section className="relative pt-24 pb-20 px-4 md:px-8">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="mb-12 border-b-4 border-[#CCFF00] pb-6">
            <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tighter leading-none">
              {t.title}<span className="text-[#CCFF00]">{t.titleAccent}</span>
            </h1>
            <p className="text-[#888888] uppercase tracking-wider mt-2">
              {t.welcome} <span className="text-[#CCFF00]">{mockUser.full_name}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="border-4 border-[#CCFF00] bg-[#0a0a0a] sticky top-24">
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
                <nav className="p-4 space-y-2">
                  {([
                    { id: "profile" as Tab, icon: User, label: t.tabs.profile },
                    { id: "addresses" as Tab, icon: MapPin, label: t.tabs.addresses },
                    { id: "orders" as Tab, icon: Package, label: t.tabs.orders },
                  ]).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 font-bold uppercase tracking-wider transition-colors ${activeTab === item.id ? "bg-[#CCFF00] text-[#0a0a0a]" : "text-white hover:bg-[#1a1a1a] hover:text-[#CCFF00]"}`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </button>
                  ))}
                  <Link href="/wishlist" className="w-full flex items-center gap-3 px-4 py-3 font-bold uppercase tracking-wider text-white hover:bg-[#1a1a1a] hover:text-[#CCFF00] transition-colors">
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

            <div className="lg:col-span-3">
              {activeTab === "profile" && (
                <div className="border-4 border-[#CCFF00] p-6">
                  <h2 className="text-2xl font-bold text-white uppercase tracking-wider mb-6 pb-4 border-b-2 border-[#333333]">{t.profile.title}</h2>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { label: t.profile.fullName, value: mockUser.full_name },
                        { label: t.profile.email, value: mockUser.email },
                        { label: t.profile.phone, value: mockUser.phone },
                        { label: t.profile.memberSince, value: formatDate(mockUser.created_at) },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <label className="block text-[#888888] text-sm uppercase tracking-wider mb-2">{label}</label>
                          <p className="text-white text-xl font-bold uppercase">{value}</p>
                        </div>
                      ))}
                    </div>
                    <button className="px-8 py-4 bg-[#CCFF00] text-[#0a0a0a] font-bold uppercase tracking-wider border-4 border-[#CCFF00] hover:bg-[#0a0a0a] hover:text-[#CCFF00] transition-colors">{t.profile.editProfile}</button>
                  </div>
                </div>
              )}

              {activeTab === "addresses" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white uppercase tracking-wider">{t.addresses.title}</h2>
                    {!isAddingAddress && (
                      <button onClick={() => setIsAddingAddress(true)} className="flex items-center gap-2 px-6 py-3 bg-[#CCFF00] text-[#0a0a0a] font-bold uppercase tracking-wider border-4 border-[#CCFF00] hover:bg-[#0a0a0a] hover:text-[#CCFF00] transition-colors">
                        <Plus className="w-5 h-5" />
                        {t.addresses.addNew}
                      </button>
                    )}
                  </div>

                  {isAddingAddress && (
                    <div className="border-4 border-[#CCFF00] p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                          { label: `${t.addresses.recipientName} *`, field: "recipient_name" as const },
                          { label: `${t.addresses.phone} *`, field: "phone" as const },
                        ].map(({ label, field }) => (
                          <div key={field}>
                            <label className="block text-white text-sm font-bold uppercase tracking-wider mb-2">{label}</label>
                            <input type="text" value={addressForm[field]} onChange={(e) => setAddressForm((prev) => ({ ...prev, [field]: e.target.value }))} className="w-full px-4 py-3 bg-[#1a1a1a] border-2 border-[#333333] text-white focus:border-[#CCFF00] focus:outline-none" />
                          </div>
                        ))}
                        <div className="md:col-span-2">
                          <label className="block text-white text-sm font-bold uppercase tracking-wider mb-2">{t.addresses.address} *</label>
                          <input type="text" value={addressForm.address_line1} onChange={(e) => setAddressForm((prev) => ({ ...prev, address_line1: e.target.value }))} className="w-full px-4 py-3 bg-[#1a1a1a] border-2 border-[#333333] text-white focus:border-[#CCFF00] focus:outline-none mb-3" placeholder="Address Line 1" />
                          <input type="text" value={addressForm.address_line2} onChange={(e) => setAddressForm((prev) => ({ ...prev, address_line2: e.target.value }))} className="w-full px-4 py-3 bg-[#1a1a1a] border-2 border-[#333333] text-white focus:border-[#CCFF00] focus:outline-none" placeholder="Address Line 2 (optional)" />
                        </div>
                        {[
                          { label: `${t.addresses.city} *`, field: "city" as const },
                          { label: `${t.addresses.postalCode} *`, field: "postal_code" as const },
                        ].map(({ label, field }) => (
                          <div key={field}>
                            <label className="block text-white text-sm font-bold uppercase tracking-wider mb-2">{label}</label>
                            <input type="text" value={addressForm[field]} onChange={(e) => setAddressForm((prev) => ({ ...prev, [field]: e.target.value }))} className="w-full px-4 py-3 bg-[#1a1a1a] border-2 border-[#333333] text-white focus:border-[#CCFF00] focus:outline-none" />
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-4 mt-6">
                        <button onClick={handleSaveAddress} className="px-8 py-3 bg-[#CCFF00] text-[#0a0a0a] font-bold uppercase tracking-wider border-4 border-[#CCFF00] hover:bg-[#0a0a0a] hover:text-[#CCFF00] transition-colors">{t.addresses.save}</button>
                        <button onClick={() => { setIsAddingAddress(false); setEditingAddress(null); setAddressForm({ recipient_name: "", phone: "", address_line1: "", address_line2: "", city: "", postal_code: "" }) }} className="px-8 py-3 bg-transparent text-[#888888] font-bold uppercase tracking-wider border-4 border-[#333333] hover:border-[#888888] hover:text-white transition-colors">{t.addresses.cancel}</button>
                      </div>
                    </div>
                  )}

                  {addresses.length === 0 ? (
                    <div className="text-center py-16 border-4 border-dashed border-[#333333]">
                      <MapPin className="w-16 h-16 text-[#333333] mx-auto mb-4" />
                      <p className="text-[#888888] text-xl uppercase tracking-wider mb-2">{t.addresses.noAddresses}</p>
                      <p className="text-[#666666] text-sm">{t.addresses.addFirst}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {addresses.map((addr) => (
                        <div key={addr.id} className={`border-4 p-6 ${addr.is_default ? "border-[#CCFF00]" : "border-[#333333]"}`}>
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
                            {!addr.is_default && <button onClick={() => handleSetDefaultAddress(addr.id)} className="text-[#CCFF00] text-sm font-bold uppercase hover:underline">{t.addresses.setDefault}</button>}
                            <button onClick={() => startEditAddress(addr)} className="flex items-center gap-1 text-[#888888] text-sm font-bold uppercase hover:text-white"><Edit2 className="w-4 h-4" />{t.addresses.edit}</button>
                            <button onClick={() => handleDeleteAddress(addr.id)} className="flex items-center gap-1 text-[#ff4444] text-sm font-bold uppercase hover:text-white"><Trash2 className="w-4 h-4" />{t.addresses.delete}</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "orders" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white uppercase tracking-wider">{t.orders.title}</h2>
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
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border-b-2 border-[#333333]">
                            <div className="flex items-center gap-6">
                              {[
                                { label: t.orders.orderNumber, value: order.order_number },
                                { label: t.orders.date, value: formatDate(order.created_at) },
                              ].map(({ label, value }) => (
                                <div key={label}>
                                  <p className="text-[#888888] text-xs uppercase">{label}</p>
                                  <p className="text-white font-bold">{value}</p>
                                </div>
                              ))}
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
                          <div className="p-4">
                            <p className="text-[#888888] text-xs uppercase mb-3">{t.orders.items}</p>
                            <div className="flex flex-wrap gap-4">
                              {order.items.map((item, index) => (
                                <div key={index} className="flex items-center gap-3">
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
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} language={language} />
    </main>
  )
}
