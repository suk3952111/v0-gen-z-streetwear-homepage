"use client"

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  CheckCircle,
  ChevronRight,
  Edit2,
  Heart,
  LogOut,
  MapPin,
  Package,
  Plus,
  Star,
  Trash2,
  User,
} from "lucide-react"
import { useI18n } from "@/lib/i18n/use-i18n"
import { ConfirmModal, NoiseOverlay } from "@/components/ui"
import { logoutAction } from "@/features/users/actions/logout"
import { loadAccountOverviewAction } from "@/features/users/actions/account/load-overview"
import { saveAccountAddressAction } from "@/features/users/actions/account/save-address"
import { setDefaultAccountAddressAction } from "@/features/users/actions/account/set-default-address"
import { deleteAccountAddressAction } from "@/features/users/actions/account/delete-address"
import { updateAccountProfileAction } from "@/features/users/actions/account/update-profile"
import type { AccountAddress, AccountOrder, AccountProfile } from "@/features/users/types/account"

type Tab = "profile" | "addresses" | "orders"

export function AccountView() {
  const { locale, t } = useI18n("users.account")
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<Tab>("profile")
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<AccountProfile | null>(null)
  const [addresses, setAddresses] = useState<AccountAddress[]>([])
  const [orders, setOrders] = useState<AccountOrder[]>([])
  const [actionError, setActionError] = useState<string | null>(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    phone: "",
    avatar_url: "",
  })
  const [isSavingAddress, setIsSavingAddress] = useState(false)
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [editingAddress, setEditingAddress] = useState<string | null>(null)
  const [addressForm, setAddressForm] = useState({
    recipient_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    postal_code: "",
  })

  useEffect(() => {
    const tab = searchParams.get("tab")
    const add = searchParams.get("add")

    if (tab === "addresses") {
      setActiveTab("addresses")
      if (add === "1") {
        setIsAddingAddress(true)
      }
      return
    }

    if (tab === "orders") {
      setActiveTab("orders")
      return
    }

    if (tab === "profile") {
      setActiveTab("profile")
    }
  }, [searchParams])

  useEffect(() => {
    let cancelled = false

    const loadOverview = async () => {
      setIsLoading(true)
      setActionError(null)
      const result = await loadAccountOverviewAction()
      if (cancelled) return

      if (!result.success || !result.data) {
        setActionError(result.errorMessage ?? "Failed to load account data")
        setProfile(null)
        setAddresses([])
        setOrders([])
        setIsLoading(false)
        return
      }

      setProfile(result.data.profile)
      setProfileForm({
        full_name: result.data.profile.full_name ?? "",
        phone: result.data.profile.phone ?? "",
        avatar_url: result.data.profile.avatar_url ?? "",
      })
      setAddresses(result.data.addresses)
      setOrders(result.data.orders)
      setIsLoading(false)
    }

    void loadOverview()

    return () => {
      cancelled = true
    }
  }, [])

  const resetAddressForm = () => {
    setAddressForm({
      recipient_name: "",
      phone: "",
      address_line1: "",
      address_line2: "",
      city: "",
      postal_code: "",
    })
    setEditingAddress(null)
    setIsAddingAddress(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === "KR" ? "ko-KR" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatPrice = (amount: number) => {
    if (locale === "KR") return `${Math.round(amount).toLocaleString()} KRW`
    return `$${Math.max(1, Math.round(amount / 1000))}`
  }

  const handleSaveProfile = async () => {
    setIsSavingProfile(true)
    setActionError(null)
    const result = await updateAccountProfileAction({
      full_name: profileForm.full_name,
      phone: profileForm.phone,
      avatar_url: profileForm.avatar_url,
    })
    setIsSavingProfile(false)

    if (!result.success || !result.data) {
      setActionError(result.errorMessage ?? "Failed to update profile")
      return
    }

    setProfile(result.data)
    setProfileForm({
      full_name: result.data.full_name ?? "",
      phone: result.data.phone ?? "",
      avatar_url: result.data.avatar_url ?? "",
    })
    setIsEditingProfile(false)
    router.refresh()
  }

  const handleSetDefaultAddress = async (id: string) => {
    setActionError(null)
    const result = await setDefaultAccountAddressAction({ id })
    if (!result.success) {
      setActionError(result.errorMessage ?? "Failed to set default address")
      return
    }
    setAddresses(result.data)
  }

  const handleDeleteAddress = async (id: string) => {
    setActionError(null)
    const result = await deleteAccountAddressAction({ id })
    if (!result.success) {
      setActionError(result.errorMessage ?? "Failed to delete address")
      return
    }
    setAddresses(result.data)
  }

  const handleSaveAddress = async () => {
    setIsSavingAddress(true)
    setActionError(null)

    const result = await saveAccountAddressAction({
      id: editingAddress ?? undefined,
      recipient_name: addressForm.recipient_name,
      phone: addressForm.phone,
      address_line1: addressForm.address_line1,
      address_line2: addressForm.address_line2,
      city: addressForm.city,
      postal_code: addressForm.postal_code,
    })

    setIsSavingAddress(false)
    if (!result.success) {
      setActionError(result.errorMessage ?? "Failed to save address")
      return
    }

    setAddresses(result.data)
    resetAddressForm()
  }

  const startEditAddress = (addr: AccountAddress) => {
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
      case "delivered":
        return "text-[#00FF88]"
      case "shipped":
        return "text-[#00CCFF]"
      case "confirmed":
        return "text-[#CCFF00]"
      case "pending":
        return "text-[#FFCC00]"
      case "cancelled":
        return "text-[#FF4444]"
      default:
        return "text-white"
    }
  }

  const handleConfirmLogout = () => {
    startTransition(async () => {
      await logoutAction()
    })
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <section className="relative pt-24 pb-20 px-4 md:px-8">
        <NoiseOverlay />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="mb-12 border-b-4 border-[#CCFF00] pb-6">
            <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tighter leading-none">
              {t("title")}
              <span className="text-[#CCFF00]">{t("titleAccent")}</span>
            </h1>
            <p className="text-[#888888] uppercase tracking-wider mt-2">
              {t("welcome")} <span className="text-[#CCFF00]">{profile?.full_name ?? "USER"}</span>
            </p>
          </div>

          {actionError && (
            <p className="mb-6 text-[#ff6666] text-sm uppercase tracking-wider">{actionError}</p>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="border-4 border-[#CCFF00] bg-[#0a0a0a] sticky top-24">
                <div className="p-6 border-b-4 border-[#CCFF00] text-center">
                  <div className="w-24 h-24 mx-auto mb-4 border-4 border-[#CCFF00] bg-[#1a1a1a] overflow-hidden">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile?.full_name ?? "User"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <User className="w-12 h-12 text-[#CCFF00]" />
                      </div>
                    )}
                  </div>
                  <p className="text-white font-bold text-xl uppercase">{profile?.full_name ?? "USER"}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Star className="w-4 h-4 text-[#CCFF00] fill-[#CCFF00]" />
                    <span className="text-[#CCFF00] text-sm font-bold uppercase">
                      {t("profile.vibeLevel")}: GOLD
                    </span>
                  </div>
                </div>
                <nav className="p-4 space-y-2">
                  {([
                    { id: "profile" as Tab, icon: User, label: t("tabs.profile") },
                    { id: "addresses" as Tab, icon: MapPin, label: t("tabs.addresses") },
                    { id: "orders" as Tab, icon: Package, label: t("tabs.orders") },
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
                  <Link
                    href="/wishlist"
                    className="w-full flex items-center gap-3 px-4 py-3 font-bold uppercase tracking-wider text-white hover:bg-[#1a1a1a] hover:text-[#CCFF00] transition-colors"
                  >
                    <Heart className="w-5 h-5" />
                    {t("tabs.wishlist")}
                  </Link>
                  <div className="border-t-2 border-[#333333] pt-4 mt-4">
                    <button
                      type="button"
                      onClick={() => setIsLogoutConfirmOpen(true)}
                      className="w-full flex items-center gap-3 px-4 py-3 font-bold uppercase tracking-wider text-[#ff4444] hover:bg-[#1a1a1a] transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      {t("logout")}
                    </button>
                  </div>
                </nav>
              </div>
            </div>

            <div className="lg:col-span-3">
              {activeTab === "profile" && (
                <div className="border-4 border-[#CCFF00] p-6">
                  <h2 className="text-2xl font-bold text-white uppercase tracking-wider mb-6 pb-4 border-b-2 border-[#333333]">
                    {t("profile.title")}
                  </h2>
                  {isLoading ? (
                    <p className="text-[#888888] uppercase tracking-wider text-sm">
                      {locale === "KR" ? "Loading profile..." : "Loading profile..."}
                    </p>
                  ) : isEditingProfile ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[#888888] text-sm uppercase tracking-wider mb-2">
                            {t("profile.fullName")}
                          </label>
                          <input
                            type="text"
                            value={profileForm.full_name}
                            onChange={(e) =>
                              setProfileForm((prev) => ({ ...prev, full_name: e.target.value }))
                            }
                            className="w-full px-4 py-3 bg-[#1a1a1a] border-2 border-[#333333] text-white focus:border-[#CCFF00] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[#888888] text-sm uppercase tracking-wider mb-2">
                            {t("profile.phone")}
                          </label>
                          <input
                            type="text"
                            value={profileForm.phone}
                            onChange={(e) =>
                              setProfileForm((prev) => ({ ...prev, phone: e.target.value }))
                            }
                            className="w-full px-4 py-3 bg-[#1a1a1a] border-2 border-[#333333] text-white focus:border-[#CCFF00] focus:outline-none"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[#888888] text-sm uppercase tracking-wider mb-2">
                            {locale === "KR" ? "프로필 이미지 URL" : "Profile Image URL"}
                          </label>
                          <input
                            type="url"
                            value={profileForm.avatar_url}
                            onChange={(e) =>
                              setProfileForm((prev) => ({ ...prev, avatar_url: e.target.value }))
                            }
                            placeholder="https://..."
                            className="w-full px-4 py-3 bg-[#1a1a1a] border-2 border-[#333333] text-white focus:border-[#CCFF00] focus:outline-none"
                          />
                          <p className="mt-2 text-xs text-[#666666]">
                            {locale === "KR"
                              ? "http:// 또는 https:// 로 시작하는 이미지 주소를 입력하세요."
                              : "Use an image URL starting with http:// or https://"}
                          </p>
                        </div>
                      </div>
                      <div className="w-24 h-24 border-2 border-[#333333] bg-[#1a1a1a] overflow-hidden">
                        {profileForm.avatar_url.trim().length > 0 ? (
                          <img
                            src={profileForm.avatar_url}
                            alt="Preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <User className="w-10 h-10 text-[#555555]" />
                          </div>
                        )}
                      </div>
                      <div className="flex gap-4">
                        <button
                          disabled={isSavingProfile || profileForm.full_name.trim().length === 0}
                          onClick={() => void handleSaveProfile()}
                          className="px-8 py-4 bg-[#CCFF00] text-[#0a0a0a] font-bold uppercase tracking-wider border-4 border-[#CCFF00] hover:bg-[#0a0a0a] hover:text-[#CCFF00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {t("addresses.save")}
                        </button>
                        <button
                          disabled={isSavingProfile}
                          onClick={() => {
                            setIsEditingProfile(false)
                            setProfileForm({
                              full_name: profile?.full_name ?? "",
                              phone: profile?.phone ?? "",
                              avatar_url: profile?.avatar_url ?? "",
                            })
                          }}
                          className="px-8 py-4 bg-transparent text-[#888888] font-bold uppercase tracking-wider border-4 border-[#333333] hover:border-[#888888] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {t("addresses.cancel")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                          { label: t("profile.fullName"), value: profile?.full_name ?? "-" },
                          { label: t("profile.email"), value: profile?.email ?? "-" },
                          { label: t("profile.phone"), value: profile?.phone ?? "-" },
                          {
                            label: t("profile.memberSince"),
                            value: profile?.created_at ? formatDate(profile.created_at) : "-",
                          },
                        ].map(({ label, value }) => (
                          <div key={label}>
                            <label className="block text-[#888888] text-sm uppercase tracking-wider mb-2">
                              {label}
                            </label>
                            <p className="text-white text-xl font-bold uppercase">{value}</p>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => {
                          setIsEditingProfile(true)
                          setProfileForm({
                            full_name: profile?.full_name ?? "",
                            phone: profile?.phone ?? "",
                            avatar_url: profile?.avatar_url ?? "",
                          })
                        }}
                        className="px-8 py-4 bg-[#CCFF00] text-[#0a0a0a] font-bold uppercase tracking-wider border-4 border-[#CCFF00] hover:bg-[#0a0a0a] hover:text-[#CCFF00] transition-colors"
                      >
                        {t("profile.editProfile")}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "addresses" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white uppercase tracking-wider">
                      {t("addresses.title")}
                    </h2>
                    {!isAddingAddress && (
                      <button
                        onClick={() => setIsAddingAddress(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-[#CCFF00] text-[#0a0a0a] font-bold uppercase tracking-wider border-4 border-[#CCFF00] hover:bg-[#0a0a0a] hover:text-[#CCFF00] transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                        {t("addresses.addNew")}
                      </button>
                    )}
                  </div>

                  {isAddingAddress && (
                    <div className="border-4 border-[#CCFF00] p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                          { label: `${t("addresses.recipientName")} *`, field: "recipient_name" as const },
                          { label: `${t("addresses.phone")} *`, field: "phone" as const },
                        ].map(({ label, field }) => (
                          <div key={field}>
                            <label className="block text-white text-sm font-bold uppercase tracking-wider mb-2">
                              {label}
                            </label>
                            <input
                              type="text"
                              value={addressForm[field]}
                              onChange={(e) => setAddressForm((prev) => ({ ...prev, [field]: e.target.value }))}
                              className="w-full px-4 py-3 bg-[#1a1a1a] border-2 border-[#333333] text-white focus:border-[#CCFF00] focus:outline-none"
                            />
                          </div>
                        ))}
                        <div className="md:col-span-2">
                          <label className="block text-white text-sm font-bold uppercase tracking-wider mb-2">
                            {t("addresses.address")} *
                          </label>
                          <input
                            type="text"
                            value={addressForm.address_line1}
                            onChange={(e) =>
                              setAddressForm((prev) => ({ ...prev, address_line1: e.target.value }))
                            }
                            className="w-full px-4 py-3 bg-[#1a1a1a] border-2 border-[#333333] text-white focus:border-[#CCFF00] focus:outline-none mb-3"
                            placeholder={t("addresses.addressLine1")}
                          />
                          <input
                            type="text"
                            value={addressForm.address_line2}
                            onChange={(e) =>
                              setAddressForm((prev) => ({ ...prev, address_line2: e.target.value }))
                            }
                            className="w-full px-4 py-3 bg-[#1a1a1a] border-2 border-[#333333] text-white focus:border-[#CCFF00] focus:outline-none"
                            placeholder={t("addresses.addressLine2")}
                          />
                        </div>
                        {[
                          { label: `${t("addresses.city")} *`, field: "city" as const },
                          { label: `${t("addresses.postalCode")} *`, field: "postal_code" as const },
                        ].map(({ label, field }) => (
                          <div key={field}>
                            <label className="block text-white text-sm font-bold uppercase tracking-wider mb-2">
                              {label}
                            </label>
                            <input
                              type="text"
                              value={addressForm[field]}
                              onChange={(e) => setAddressForm((prev) => ({ ...prev, [field]: e.target.value }))}
                              className="w-full px-4 py-3 bg-[#1a1a1a] border-2 border-[#333333] text-white focus:border-[#CCFF00] focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-4 mt-6">
                        <button
                          disabled={isSavingAddress}
                          onClick={() => void handleSaveAddress()}
                          className="px-8 py-3 bg-[#CCFF00] text-[#0a0a0a] font-bold uppercase tracking-wider border-4 border-[#CCFF00] hover:bg-[#0a0a0a] hover:text-[#CCFF00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {t("addresses.save")}
                        </button>
                        <button
                          disabled={isSavingAddress}
                          onClick={resetAddressForm}
                          className="px-8 py-3 bg-transparent text-[#888888] font-bold uppercase tracking-wider border-4 border-[#333333] hover:border-[#888888] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {t("addresses.cancel")}
                        </button>
                      </div>
                    </div>
                  )}

                  {addresses.length === 0 ? (
                    <div className="text-center py-16 border-4 border-dashed border-[#333333]">
                      <MapPin className="w-16 h-16 text-[#333333] mx-auto mb-4" />
                      <p className="text-[#888888] text-xl uppercase tracking-wider mb-2">
                        {t("addresses.noAddresses")}
                      </p>
                      <p className="text-[#666666] text-sm">{t("addresses.addFirst")}</p>
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
                              {t("addresses.default")}
                            </span>
                          )}
                          <p className="text-white font-bold text-lg mb-1">{addr.recipient_name}</p>
                          <p className="text-[#888888] mb-2">{addr.phone}</p>
                          <p className="text-white">{addr.address_line1}</p>
                          {addr.address_line2 && <p className="text-white">{addr.address_line2}</p>}
                          <p className="text-white">
                            {addr.city}, {addr.postal_code}
                          </p>
                          <div className="flex gap-3 mt-4 pt-4 border-t-2 border-[#333333]">
                            {!addr.is_default && (
                              <button
                                onClick={() => void handleSetDefaultAddress(addr.id)}
                                className="text-[#CCFF00] text-sm font-bold uppercase hover:underline"
                              >
                                {t("addresses.setDefault")}
                              </button>
                            )}
                            <button
                              onClick={() => startEditAddress(addr)}
                              className="flex items-center gap-1 text-[#888888] text-sm font-bold uppercase hover:text-white"
                            >
                              <Edit2 className="w-4 h-4" />
                              {t("addresses.edit")}
                            </button>
                            <button
                              onClick={() => void handleDeleteAddress(addr.id)}
                              className="flex items-center gap-1 text-[#ff4444] text-sm font-bold uppercase hover:text-white"
                            >
                              <Trash2 className="w-4 h-4" />
                              {t("addresses.delete")}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "orders" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white uppercase tracking-wider">
                    {t("orders.title")}
                  </h2>
                  {orders.length === 0 ? (
                    <div className="text-center py-16 border-4 border-dashed border-[#333333]">
                      <Package className="w-16 h-16 text-[#333333] mx-auto mb-4" />
                      <p className="text-[#888888] text-xl uppercase tracking-wider mb-2">
                        {t("orders.noOrders")}
                      </p>
                      <p className="text-[#666666] text-sm">{t("orders.startShopping")}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="border-4 border-[#333333] hover:border-[#CCFF00] transition-colors"
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border-b-2 border-[#333333]">
                            <div className="flex items-center gap-6">
                              {[
                                { label: t("orders.orderNumber"), value: order.order_number },
                                { label: t("orders.date"), value: formatDate(order.created_at) },
                              ].map(({ label, value }) => (
                                <div key={label}>
                                  <p className="text-[#888888] text-xs uppercase">{label}</p>
                                  <p className="text-white font-bold">{value}</p>
                                </div>
                              ))}
                              <div>
                                <p className="text-[#888888] text-xs uppercase">{t("orders.status")}</p>
                                <p className={`font-bold uppercase ${getStatusColor(order.status)}`}>
                                  {t(`orders.statuses.${order.status}`)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[#888888] text-xs uppercase">{t("orders.total")}</p>
                              <p className="text-[#CCFF00] text-xl font-bold">{formatPrice(order.final_amount)}</p>
                            </div>
                          </div>
                          <div className="p-4">
                            <p className="text-[#888888] text-xs uppercase mb-3">{t("orders.items")}</p>
                            <div className="flex flex-wrap gap-4">
                              {order.items.map((item, index) => (
                                <div key={index} className="flex items-center gap-3">
                                  <p className="text-white text-sm font-bold uppercase max-w-[150px] truncate">
                                    {item.name} x{item.quantity}
                                  </p>
                                </div>
                              ))}
                            </div>
                            <button className="flex items-center gap-2 text-[#CCFF00] text-sm font-bold uppercase mt-4 hover:underline">
                              {t("orders.viewDetails")}
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

      <ConfirmModal
        isOpen={isLogoutConfirmOpen}
        title={t("logoutConfirm.title")}
        description={t("logoutConfirm.description")}
        confirmLabel={t("logoutConfirm.yes")}
        cancelLabel={t("logoutConfirm.no")}
        isLoading={isPending}
        onCancel={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </main>
  )
}

