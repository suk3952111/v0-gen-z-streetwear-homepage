"use client"

import Link from "next/link"
import { useI18n } from "@/lib/i18n/use-i18n"

export function Footer({ language }: { language?: "EN" | "KR" }) {
  const { t } = useI18n("layout.footer")

  const shopLinks = [t("shopLinks.0"), t("shopLinks.1"), t("shopLinks.2"), t("shopLinks.3")]
  const infoLinks = [t("infoLinks.0"), t("infoLinks.1"), t("infoLinks.2"), t("infoLinks.3")]

  return (
    <footer className="border-t-4 border-[#CCFF00] bg-[#0a0a0a] py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-1">
            <h3 className="text-3xl font-bold text-[#CCFF00] tracking-tighter mb-4">VIBE CHECK</h3>
            <p className="text-white text-sm leading-relaxed">{t("tagline")}</p>
          </div>

          <div>
            <h4 className="text-white text-lg font-bold uppercase tracking-wider mb-4 border-b-2 border-[#CCFF00] pb-2">{t("shop")}</h4>
            <ul className="space-y-2">
              {shopLinks.map((link, i) => (
                <li key={i}><Link href="#" className="text-[#888888] hover:text-[#CCFF00] transition-colors uppercase text-sm">{link}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white text-lg font-bold uppercase tracking-wider mb-4 border-b-2 border-[#CCFF00] pb-2">{t("info")}</h4>
            <ul className="space-y-2">
              {infoLinks.map((link, i) => (
                <li key={i}><Link href="#" className="text-[#888888] hover:text-[#CCFF00] transition-colors uppercase text-sm">{link}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white text-lg font-bold uppercase tracking-wider mb-4 border-b-2 border-[#CCFF00] pb-2">{t("newsletter")}</h4>
            <div className="flex">
              <input
                type="email"
                placeholder={t("emailPlaceholder")}
                className="flex-1 px-4 py-3 bg-[#1a1a1a] text-white border-4 border-[#CCFF00] border-r-0 placeholder:text-[#888888] focus:outline-none text-sm uppercase"
              />
              <button className="px-4 py-3 bg-[#CCFF00] text-[#0a0a0a] font-bold uppercase border-4 border-[#CCFF00] hover:bg-[#0a0a0a] hover:text-[#CCFF00] transition-colors">
                {t("joinBtn")}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t-2 border-[#1a1a1a]">
          <p className="text-[#888888] text-sm uppercase">{t("copyright")}</p>
          <div className="flex gap-6">
            <Link href="#" className="text-[#888888] hover:text-[#CCFF00] transition-colors text-sm uppercase">{t("privacy")}</Link>
            <Link href="#" className="text-[#888888] hover:text-[#CCFF00] transition-colors text-sm uppercase">{t("terms")}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
