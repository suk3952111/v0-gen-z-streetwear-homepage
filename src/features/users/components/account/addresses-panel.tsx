"use client"

import { CheckCircle, Edit2, MapPin, Plus, Trash2 } from "lucide-react"
import type { AccountAddress } from "@/features/users/types/account"
import type {
  AccountAddressField,
  AccountAddressFormState,
  AccountTranslator,
} from "./types"

type AddressesPanelProps = {
  addressForm: AccountAddressFormState
  addresses: AccountAddress[]
  isAddingAddress: boolean
  isSavingAddress: boolean
  onAddressFieldChange: (field: AccountAddressField, value: string) => void
  onCancel: () => void
  onDelete: (id: string) => void | Promise<void>
  onSave: () => void | Promise<void>
  onSetDefault: (id: string) => void | Promise<void>
  onStartAdd: () => void
  onStartEdit: (address: AccountAddress) => void
  t: AccountTranslator
}

export function AddressesPanel({
  addressForm,
  addresses,
  isAddingAddress,
  isSavingAddress,
  onAddressFieldChange,
  onCancel,
  onDelete,
  onSave,
  onSetDefault,
  onStartAdd,
  onStartEdit,
  t,
}: AddressesPanelProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white uppercase tracking-wider">
          {t("addresses.title")}
        </h2>
        {!isAddingAddress && (
          <button
            onClick={onStartAdd}
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
                  onChange={(event) => onAddressFieldChange(field, event.target.value)}
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
                onChange={(event) => onAddressFieldChange("address_line1", event.target.value)}
                className="w-full px-4 py-3 bg-[#1a1a1a] border-2 border-[#333333] text-white focus:border-[#CCFF00] focus:outline-none mb-3"
                placeholder={t("addresses.addressLine1")}
              />
              <input
                type="text"
                value={addressForm.address_line2}
                onChange={(event) => onAddressFieldChange("address_line2", event.target.value)}
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
                  onChange={(event) => onAddressFieldChange(field, event.target.value)}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border-2 border-[#333333] text-white focus:border-[#CCFF00] focus:outline-none"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-6">
            <button
              disabled={isSavingAddress}
              onClick={() => void onSave()}
              className="px-8 py-3 bg-[#CCFF00] text-[#0a0a0a] font-bold uppercase tracking-wider border-4 border-[#CCFF00] hover:bg-[#0a0a0a] hover:text-[#CCFF00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("addresses.save")}
            </button>

            <button
              disabled={isSavingAddress}
              onClick={onCancel}
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
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`border-4 p-6 ${
                address.is_default ? "border-[#CCFF00]" : "border-[#333333]"
              }`}
            >
              {address.is_default && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#CCFF00] text-[#0a0a0a] text-xs font-bold uppercase mb-4">
                  <CheckCircle className="w-3 h-3" />
                  {t("addresses.default")}
                </span>
              )}

              <p className="text-white font-bold text-lg mb-1">{address.recipient_name}</p>
              <p className="text-[#888888] mb-2">{address.phone}</p>
              <p className="text-white">{address.address_line1}</p>
              {address.address_line2 && <p className="text-white">{address.address_line2}</p>}
              <p className="text-white">
                {address.city}, {address.postal_code}
              </p>

              <div className="flex gap-3 mt-4 pt-4 border-t-2 border-[#333333]">
                {!address.is_default && (
                  <button
                    onClick={() => void onSetDefault(address.id)}
                    className="text-[#CCFF00] text-sm font-bold uppercase hover:underline"
                  >
                    {t("addresses.setDefault")}
                  </button>
                )}

                <button
                  onClick={() => onStartEdit(address)}
                  className="flex items-center gap-1 text-[#888888] text-sm font-bold uppercase hover:text-white"
                >
                  <Edit2 className="w-4 h-4" />
                  {t("addresses.edit")}
                </button>

                <button
                  onClick={() => void onDelete(address.id)}
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
  )
}
