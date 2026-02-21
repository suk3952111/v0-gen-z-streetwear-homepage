"use client"

import { useI18n } from "@/lib/i18n/use-i18n"

export function MarqueeBanner({ language }: { language?: "EN" | "KR" }) {
  const { t } = useI18n("products.home")
  const text = t("marquee")

  return (
    <div className="relative overflow-hidden border-y-4 border-[#CCFF00] bg-[#CCFF00] py-3">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...Array(4)].map((_, i) => (
          <span key={i} className="text-[#0a0a0a] text-sm md:text-base font-bold uppercase tracking-wider mx-4">
            {text}
          </span>
        ))}
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee { animation: marquee 20s linear infinite; }
      `}</style>
    </div>
  )
}
