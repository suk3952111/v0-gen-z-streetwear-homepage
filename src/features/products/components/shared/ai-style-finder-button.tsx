"use client"

import { Sparkles } from "lucide-react"
import { useI18n } from "@/lib/i18n/use-i18n"

interface AIStyleFinderButtonProps {
  language?: "EN" | "KR"
  onClick: () => void
}

export function AIStyleFinderButton({ onClick }: AIStyleFinderButtonProps) {
  const { t } = useI18n("products.styleFinder")

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-6 py-4 bg-[#0a0a0a] text-[#CCFF00] font-bold uppercase tracking-wider border-4 border-[#CCFF00] hover:bg-[#CCFF00] hover:text-[#0a0a0a] transition-colors"
      style={{ animation: "pulse-glow 2s ease-in-out infinite" }}
      aria-label={t("button")}
    >
      <Sparkles className="w-5 h-5" />
      <span className="hidden sm:inline">{t("button")}</span>
      <span className="sm:hidden">AI</span>
    </button>
  )
}
