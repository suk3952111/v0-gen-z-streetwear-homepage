"use client"

import Link from "next/link"
import { ShoppingBag, Menu, X, User, Heart } from "lucide-react"
import { useState, useTransition } from "react"
import { ConfirmModal } from "@/components/ui"
import { logoutAction } from "@/features/users/actions/logout"
import { useWishlist } from "@/components/providers/wishlist-provider"
import { useI18n } from "@/lib/i18n/use-i18n"

interface HeaderProps {
  language?: "EN" | "KR"
  onLanguageChange?: (lang: "EN" | "KR") => void
  onAuthClick?: () => void
  currentUser?: {
    id: string
    fullName: string | null
    role: string | null
  } | null
}

export function Header({ onAuthClick, currentUser }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { wishlistCount } = useWishlist()
  const { locale, setLocale, t } = useI18n("layout.header")

  const handleConfirmLogout = () => {
    startTransition(async () => {
      await logoutAction()
    })
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b-4 border-[#CCFF00] bg-[#0a0a0a]">
      <div className="flex items-center justify-between px-4 py-4 md:px-8">
        <Link href="/" className="text-3xl md:text-4xl font-bold text-[#CCFF00] tracking-tighter hover:text-white transition-colors">
          {t("brand")}
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/shop" className="text-white text-lg font-bold uppercase tracking-wider hover:text-[#CCFF00] transition-colors border-b-2 border-transparent hover:border-[#CCFF00]">
            {t("nav.drops")}
          </Link>
          <Link href="/shop" className="text-white text-lg font-bold uppercase tracking-wider hover:text-[#CCFF00] transition-colors border-b-2 border-transparent hover:border-[#CCFF00]">
            {t("nav.archive")}
          </Link>
          <Link href="#" className="text-white text-lg font-bold uppercase tracking-wider hover:text-[#CCFF00] transition-colors border-b-2 border-transparent hover:border-[#CCFF00]">
            {t("nav.about")}
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex border-2 border-[#CCFF00]">
            <button
              onClick={() => setLocale("EN")}
              className={`px-3 py-1.5 text-sm font-bold uppercase tracking-wider transition-colors ${
                locale === "EN"
                  ? "bg-[#CCFF00] text-[#0a0a0a]"
                  : "bg-[#0a0a0a] text-[#CCFF00] hover:bg-[#1a1a1a]"
              }`}
              aria-label={t("aria.switchToEnglish")}
            >
              EN
            </button>
            <button
              onClick={() => setLocale("KR")}
              className={`px-3 py-1.5 text-sm font-bold uppercase tracking-wider transition-colors border-l-2 border-[#CCFF00] ${
                locale === "KR"
                  ? "bg-[#CCFF00] text-[#0a0a0a]"
                  : "bg-[#0a0a0a] text-[#CCFF00] hover:bg-[#1a1a1a]"
              }`}
              aria-label={t("aria.switchToKorean")}
            >
              KR
            </button>
          </div>

          {currentUser ? (
            <>
              <Link
                href="/account"
                className="flex items-center gap-2 p-2 border-2 border-[#CCFF00] bg-[#0a0a0a] text-[#CCFF00] transition-all hover:bg-[#CCFF00] hover:text-[#0a0a0a] hover:shadow-[0_0_15px_#CCFF00]"
                aria-label={t("aria.auth")}
              >
                <User className="w-6 h-6" />
                <span className="hidden md:inline text-xs font-bold uppercase max-w-[90px] truncate">
                  {currentUser.fullName ?? "Account"}
                </span>
              </Link>

              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(true)}
                className="hidden md:inline-flex items-center px-3 py-2 border-2 border-[#FF6666] bg-[#0a0a0a] text-[#FF6666] text-xs font-bold uppercase tracking-wider transition-all hover:bg-[#FF6666] hover:text-[#0a0a0a]"
              >
                {t("logout")}
              </button>
            </>
          ) : (
            <button
              onClick={onAuthClick}
              className="p-2 border-2 border-[#CCFF00] bg-[#0a0a0a] text-[#CCFF00] transition-all hover:bg-[#CCFF00] hover:text-[#0a0a0a] hover:shadow-[0_0_15px_#CCFF00]"
              aria-label={t("aria.auth")}
            >
              <User className="w-6 h-6" />
            </button>
          )}

          <Link
            href="/wishlist"
            className="relative p-2 border-2 border-[#CCFF00] bg-[#0a0a0a] text-[#CCFF00] transition-all hover:bg-[#CCFF00] hover:text-[#0a0a0a] hover:shadow-[0_0_15px_#CCFF00]"
            aria-label={t("aria.wishlist")}
          >
            <Heart className="w-6 h-6" />
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#CCFF00] text-[#0a0a0a] text-xs font-bold flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link
            href="/cart"
            className="relative p-2 border-2 border-[#CCFF00] bg-[#0a0a0a] text-[#CCFF00] transition-all hover:bg-[#CCFF00] hover:text-[#0a0a0a] hover:shadow-[0_0_15px_#CCFF00]"
            aria-label={t("aria.cart")}
          >
            <ShoppingBag className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#CCFF00] text-[#0a0a0a] text-xs font-bold flex items-center justify-center">
              3
            </span>
          </Link>

          <button
            className="md:hidden p-2 border-2 border-[#CCFF00] bg-[#0a0a0a] text-[#CCFF00]"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={t("aria.toggleMenu")}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="md:hidden border-t-2 border-[#CCFF00] bg-[#0a0a0a]">
          <Link href="/shop" className="block px-4 py-4 text-white text-xl font-bold uppercase border-b-2 border-[#1a1a1a] hover:bg-[#CCFF00] hover:text-[#0a0a0a] transition-colors">
            {t("nav.drops")}
          </Link>
          <Link href="/shop" className="block px-4 py-4 text-white text-xl font-bold uppercase border-b-2 border-[#1a1a1a] hover:bg-[#CCFF00] hover:text-[#0a0a0a] transition-colors">
            {t("nav.archive")}
          </Link>
          <Link href="#" className="block px-4 py-4 text-white text-xl font-bold uppercase hover:bg-[#CCFF00] hover:text-[#0a0a0a] transition-colors">
            {t("nav.about")}
          </Link>
          {currentUser && (
            <button
              type="button"
              onClick={() => setIsLogoutConfirmOpen(true)}
              className="block w-full px-4 py-4 text-left text-[#FF6666] text-xl font-bold uppercase border-t-2 border-[#1a1a1a] hover:bg-[#FF6666] hover:text-[#0a0a0a] transition-colors"
            >
              {t("logout")}
            </button>
          )}
        </nav>
      )}

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
    </header>
  )
}
