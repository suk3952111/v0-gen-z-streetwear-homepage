"use client"

import { User } from "lucide-react"
import { formatDateByLocale } from "@/lib/format/date"
import type { Locale } from "@/lib/i18n/types"
import type { AccountProfile } from "@/features/users/types/account"
import type {
  AccountProfileField,
  AccountProfileFormState,
  AccountTranslator,
} from "./types"

type ProfilePanelProps = {
  isEditingProfile: boolean
  isLoading: boolean
  isSavingProfile: boolean
  locale: Locale
  onCancelEdit: () => void
  onFieldChange: (field: AccountProfileField, value: string) => void
  onSave: () => void | Promise<void>
  onStartEdit: () => void
  profile: AccountProfile | null
  profileForm: AccountProfileFormState
  t: AccountTranslator
}

export function ProfilePanel({
  isEditingProfile,
  isLoading,
  isSavingProfile,
  locale,
  onCancelEdit,
  onFieldChange,
  onSave,
  onStartEdit,
  profile,
  profileForm,
  t,
}: ProfilePanelProps) {
  const profileFields = [
    { label: t("profile.fullName"), value: profile?.full_name ?? "-" },
    { label: t("profile.email"), value: profile?.email ?? "-" },
    { label: t("profile.phone"), value: profile?.phone ?? "-" },
    {
      label: t("profile.memberSince"),
      value: profile?.created_at
        ? formatDateByLocale(profile.created_at, locale, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "-",
    },
  ]

  return (
    <div className="border-4 border-[#CCFF00] p-6">
      <h2 className="text-2xl font-bold text-white uppercase tracking-wider mb-6 pb-4 border-b-2 border-[#333333]">
        {t("profile.title")}
      </h2>

      {isLoading ? (
        <p className="text-[#888888] uppercase tracking-wider text-sm">{t("loadingProfile")}</p>
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
                onChange={(event) => onFieldChange("full_name", event.target.value)}
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
                onChange={(event) => onFieldChange("phone", event.target.value)}
                className="w-full px-4 py-3 bg-[#1a1a1a] border-2 border-[#333333] text-white focus:border-[#CCFF00] focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[#888888] text-sm uppercase tracking-wider mb-2">
                {t("profileImageUrl")}
              </label>
              <input
                type="url"
                value={profileForm.avatar_url}
                onChange={(event) => onFieldChange("avatar_url", event.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-3 bg-[#1a1a1a] border-2 border-[#333333] text-white focus:border-[#CCFF00] focus:outline-none"
              />
              <p className="mt-2 text-xs text-[#666666]">{t("profileImageHelp")}</p>
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
              onClick={() => void onSave()}
              className="px-8 py-4 bg-[#CCFF00] text-[#0a0a0a] font-bold uppercase tracking-wider border-4 border-[#CCFF00] hover:bg-[#0a0a0a] hover:text-[#CCFF00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("addresses.save")}
            </button>

            <button
              disabled={isSavingProfile}
              onClick={onCancelEdit}
              className="px-8 py-4 bg-transparent text-[#888888] font-bold uppercase tracking-wider border-4 border-[#333333] hover:border-[#888888] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("addresses.cancel")}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profileFields.map(({ label, value }) => (
              <div key={label}>
                <label className="block text-[#888888] text-sm uppercase tracking-wider mb-2">
                  {label}
                </label>
                <p className="text-white text-xl font-bold uppercase">{value}</p>
              </div>
            ))}
          </div>

          <button
            onClick={onStartEdit}
            className="px-8 py-4 bg-[#CCFF00] text-[#0a0a0a] font-bold uppercase tracking-wider border-4 border-[#CCFF00] hover:bg-[#0a0a0a] hover:text-[#CCFF00] transition-colors"
          >
            {t("profile.editProfile")}
          </button>
        </div>
      )}
    </div>
  )
}
