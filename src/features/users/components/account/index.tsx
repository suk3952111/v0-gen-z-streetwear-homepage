"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useI18n } from "@/lib/i18n/use-i18n"
import { ConfirmModal, NoiseOverlay } from "@/components/ui"
import { logoutAction } from "@/features/users/actions/logout"
import { loadAccountOverviewAction } from "@/features/users/actions/account/load-overview"
import { saveAccountAddressAction } from "@/features/users/actions/account/save-address"
import { setDefaultAccountAddressAction } from "@/features/users/actions/account/set-default-address"
import { deleteAccountAddressAction } from "@/features/users/actions/account/delete-address"
import { updateAccountProfileAction } from "@/features/users/actions/account/update-profile"
import type { AccountAddress, AccountOrder, AccountProfile } from "@/features/users/types/account"
import { AccountSidebar } from "./account-sidebar"
import { AddressesPanel } from "./addresses-panel"
import { OrdersPanel } from "./orders-panel"
import { ProfilePanel } from "./profile-panel"
import {
  EMPTY_ACCOUNT_ADDRESS_FORM,
  EMPTY_ACCOUNT_PROFILE_FORM,
  type AccountAddressField,
  type AccountAddressFormState,
  type AccountProfileField,
  type AccountProfileFormState,
  type AccountTab,
} from "./types"

export function AccountView() {
  const { locale, t } = useI18n("users.account")
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<AccountTab>("profile")
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<AccountProfile | null>(null)
  const [addresses, setAddresses] = useState<AccountAddress[]>([])
  const [orders, setOrders] = useState<AccountOrder[]>([])
  const [actionError, setActionError] = useState<string | null>(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState<AccountProfileFormState>({
    ...EMPTY_ACCOUNT_PROFILE_FORM,
  })
  const [isSavingAddress, setIsSavingAddress] = useState(false)
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [editingAddress, setEditingAddress] = useState<string | null>(null)
  const [addressForm, setAddressForm] = useState<AccountAddressFormState>({
    ...EMPTY_ACCOUNT_ADDRESS_FORM,
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
    setAddressForm({ ...EMPTY_ACCOUNT_ADDRESS_FORM })
    setEditingAddress(null)
    setIsAddingAddress(false)
  }

  const handleProfileFieldChange = (field: AccountProfileField, value: string) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddressFieldChange = (field: AccountAddressField, value: string) => {
    setAddressForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleStartEditProfile = () => {
    setIsEditingProfile(true)
    setProfileForm({
      full_name: profile?.full_name ?? "",
      phone: profile?.phone ?? "",
      avatar_url: profile?.avatar_url ?? "",
    })
  }

  const handleCancelEditProfile = () => {
    setIsEditingProfile(false)
    setProfileForm({
      full_name: profile?.full_name ?? "",
      phone: profile?.phone ?? "",
      avatar_url: profile?.avatar_url ?? "",
    })
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

  const startEditAddress = (address: AccountAddress) => {
    setAddressForm({
      recipient_name: address.recipient_name,
      phone: address.phone,
      address_line1: address.address_line1,
      address_line2: address.address_line2 || "",
      city: address.city,
      postal_code: address.postal_code,
    })
    setEditingAddress(address.id)
    setIsAddingAddress(true)
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
              <AccountSidebar
                activeTab={activeTab}
                onLogoutClick={() => setIsLogoutConfirmOpen(true)}
                onTabChange={setActiveTab}
                profile={profile}
                t={t}
              />
            </div>

            <div className="lg:col-span-3">
              {activeTab === "profile" && (
                <ProfilePanel
                  isEditingProfile={isEditingProfile}
                  isLoading={isLoading}
                  isSavingProfile={isSavingProfile}
                  locale={locale}
                  onCancelEdit={handleCancelEditProfile}
                  onFieldChange={handleProfileFieldChange}
                  onSave={handleSaveProfile}
                  onStartEdit={handleStartEditProfile}
                  profile={profile}
                  profileForm={profileForm}
                  t={t}
                />
              )}

              {activeTab === "addresses" && (
                <AddressesPanel
                  addressForm={addressForm}
                  addresses={addresses}
                  isAddingAddress={isAddingAddress}
                  isSavingAddress={isSavingAddress}
                  onAddressFieldChange={handleAddressFieldChange}
                  onCancel={resetAddressForm}
                  onDelete={handleDeleteAddress}
                  onSave={handleSaveAddress}
                  onSetDefault={handleSetDefaultAddress}
                  onStartAdd={() => setIsAddingAddress(true)}
                  onStartEdit={startEditAddress}
                  t={t}
                />
              )}

              {activeTab === "orders" && (
                <OrdersPanel locale={locale} orders={orders} t={t} />
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
