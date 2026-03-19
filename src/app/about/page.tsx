"use client"

import Image from "next/image"
import Link from "next/link"
import { Sparkles, Radar, ShieldCheck, Zap } from "lucide-react"
import { useI18n } from "@/lib/i18n/use-i18n"

const pillars = [
  {
    icon: Radar,
    titleKey: "pillars.signalDriven.title",
    descriptionKey: "pillars.signalDriven.description",
  },
  {
    icon: Sparkles,
    titleKey: "pillars.cultureFirst.title",
    descriptionKey: "pillars.cultureFirst.description",
  },
  {
    icon: ShieldCheck,
    titleKey: "pillars.qualityLocked.title",
    descriptionKey: "pillars.qualityLocked.description",
  },
]

const stats = [
  { labelKey: "stats.activeDrops", value: "126+" },
  { labelKey: "stats.curatedBrands", value: "5" },
  { labelKey: "stats.styleTags", value: "10+" },
]

export default function AboutPage() {
  const { t } = useI18n("about")

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <section className="relative overflow-hidden border-b-4 border-[#CCFF00] px-4 pb-16 pt-28 md:px-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            background:
              "radial-gradient(circle at 15% 20%, rgba(204,255,0,0.25), transparent 35%), radial-gradient(circle at 80% 10%, rgba(0,255,255,0.14), transparent 30%), linear-gradient(120deg, transparent 35%, rgba(204,255,0,0.08) 50%, transparent 65%)",
          }}
        />
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.35em] text-[#CCFF00]">
              {t("eyebrow")}
            </p>
            <h1 className="text-5xl font-black uppercase tracking-tight md:text-7xl">
              {t("heroTitleLine1")}
              <span className="block text-[#CCFF00]">{t("heroTitleLine2")}</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#d6d6d6] md:text-lg">
              {t("heroDescription")}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="border-4 border-[#CCFF00] bg-[#CCFF00] px-7 py-3 text-sm font-black uppercase tracking-wider text-[#0a0a0a] transition-colors hover:bg-[#0a0a0a] hover:text-[#CCFF00]"
              >
                {t("exploreShop")}
              </Link>
              <Link
                href="/contact"
                className="border-4 border-[#CCFF00] px-7 py-3 text-sm font-black uppercase tracking-wider text-[#CCFF00] transition-colors hover:bg-[#1b1b1b]"
              >
                {t("contactCrew")}
              </Link>
            </div>
          </div>

          <div className="relative border-4 border-[#CCFF00] bg-[#0f0f0f] p-6 md:p-8">
            <div className="absolute -right-3 -top-3 border-2 border-[#CCFF00] bg-[#0a0a0a] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#CCFF00]">
              {t("coreMark")}
            </div>
            <div className="mx-auto mb-6 flex w-fit items-center justify-center border-4 border-[#CCFF00] bg-black p-4">
              <Image src="/icon.svg" alt="VIBE CHECK icon" width={120} height={120} priority />
            </div>
            <div className="space-y-3 border-t-2 border-dashed border-[#3c3c3c] pt-5">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#CCFF00]">
                {t("systemIdentity")}
              </p>
              <p className="text-sm leading-relaxed text-[#bcbcbc]">
                {t("systemIdentityDescription")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
          {stats.map((item) => (
            <div key={item.labelKey} className="border-4 border-[#2f2f2f] bg-[#111111] p-6">
              <p className="text-4xl font-black text-[#CCFF00]">{item.value}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.25em] text-[#9a9a9a]">
                {t(item.labelKey)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 pb-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center gap-3 border-b-4 border-[#CCFF00] pb-4">
            <Zap className="h-7 w-7 text-[#CCFF00]" />
            <h2 className="text-3xl font-black uppercase tracking-tight md:text-4xl">
              {t("pillarsTitle")}
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {pillars.map((pillar) => (
              <article
                key={pillar.titleKey}
                className="group border-4 border-[#2d2d2d] bg-[#0f0f0f] p-6 transition-colors hover:border-[#CCFF00]"
              >
                <pillar.icon className="mb-4 h-7 w-7 text-[#CCFF00]" />
                <h3 className="text-xl font-black uppercase tracking-wide">{t(pillar.titleKey)}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#b7b7b7]">{t(pillar.descriptionKey)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
