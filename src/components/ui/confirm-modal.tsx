"use client"

import { X } from "lucide-react"

type ConfirmModalProps = {
  isOpen: boolean
  title: string
  description: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmModalProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/80 backdrop-blur-[2px]"
        onClick={onCancel}
        aria-label={cancelLabel}
      />

      <div className="relative w-full max-w-md border-4 border-[#CCFF00] bg-[#0a0a0a] p-6 shadow-[0_0_30px_rgba(204,255,0,0.25)]">
        <button
          type="button"
          onClick={onCancel}
          aria-label={cancelLabel}
          className="absolute right-3 top-3 border-2 border-[#333333] p-1 text-[#888888] transition-colors hover:border-[#CCFF00] hover:text-[#CCFF00]"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="pr-8 text-2xl font-bold uppercase tracking-wider text-white">{title}</h2>
        <p className="mt-3 text-sm uppercase tracking-wide text-[#aaaaaa]">{description}</p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 border-2 border-[#444444] px-4 py-3 text-sm font-bold uppercase tracking-wider text-[#bbbbbb] transition-colors hover:border-[#888888] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 border-2 border-[#CCFF00] bg-[#CCFF00] px-4 py-3 text-sm font-bold uppercase tracking-wider text-[#0a0a0a] transition-colors hover:bg-[#0a0a0a] hover:text-[#CCFF00] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
