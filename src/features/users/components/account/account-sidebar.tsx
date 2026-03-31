"use client"

import Link from "next/link"
import {
  Heart,
  LogOut,
  MapPin,
  Package,
  Star,
  User,
  type LucideIcon,
} from "lucide-react"
import type { AccountProfile } from "@/features/users/types/account"
import type { AccountTab, AccountTranslator } from "./types"

type AccountSidebarProps = {
  activeTab: AccountTab
  onLogoutClick: () => void
  onTabChange: (tab: AccountTab) => void
  profile: AccountProfile | null
  t: AccountTranslator
}

type NavItem = {
  id: AccountTab
  icon: LucideIcon
  label: string
}

export function AccountSidebar({
  activeTab,
  onLogoutClick,
  onTabChange,
  profile,
  t,
}: AccountSidebarProps) {
  const navItems: NavItem[] = [
    { id: "profile", icon: User, label: t("tabs.profile") },
    { id: "addresses", icon: MapPin, label: t("tabs.addresses") },
    { id: "orders", icon: Package, label: t("tabs.orders") },
  ]

  return (
    <div className="border-4 border-[#CCFF00] bg-[#0a0a0a] sticky top-24">
      <div className="p-6 border-b-4 border-[#CCFF00] text-center">
        <div className="w-24 h-24 mx-auto mb-4 border-4 border-[#CCFF00] bg-[#1a1a1a] overflow-hidden">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name ?? "User"}
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
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
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
          {t("tabs.wishlist")}
        </Link>

        <div className="border-t-2 border-[#333333] pt-4 mt-4">
          <button
            type="button"
            onClick={onLogoutClick}
            className="w-full flex items-center gap-3 px-4 py-3 font-bold uppercase tracking-wider text-[#ff4444] hover:bg-[#1a1a1a] transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {t("logout")}
          </button>
        </div>
      </nav>
    </div>
  )
}
