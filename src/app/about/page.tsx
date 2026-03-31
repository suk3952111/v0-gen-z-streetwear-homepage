"use client"

import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  Cpu,
  Eye,
  Github,
  Globe,
  ShoppingBag,
  Sparkles,
  Twitter,
  Zap,
} from "lucide-react"
import { aboutEnMessages } from "@/features/about/messages/en"
import { aboutKrMessages } from "@/features/about/messages/kr"
import { useI18n } from "@/lib/i18n/use-i18n"

const featureOrder = ["visualSearch", "styleMatching", "smartDropAlerts", "globalAccess"] as const
const statOrder = ["curatedItems", "matchConfidence", "fastestDelivery", "communityMindset"] as const

const iconMap = {
  eye: Eye,
  sparkles: Sparkles,
  zap: Zap,
  globe: Globe,
} as const

export default function AboutPage() {
  const { locale } = useI18n("about")
  const content = locale === "KR" ? aboutKrMessages : aboutEnMessages
  const features = featureOrder.map((key) => content.features[key])
  const stats = statOrder.map((key) => content.stats[key])

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-4 pb-16 pt-24">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to right, #CCFF00 1px, transparent 1px), linear-gradient(to bottom, #CCFF00 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#CCFF00] opacity-5 blur-[150px]" />

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <p className="mb-6 text-sm font-bold uppercase tracking-[0.4em] text-[#CCFF00]">[{content.hero.label}]</p>
          <h1 className="mb-6 text-7xl font-bold tracking-tighter md:text-9xl">
            <span className="text-white">{content.hero.title}</span>
            <span className="text-[#CCFF00]">{content.hero.titleAccent}</span>
          </h1>
          <p className="mb-6 text-2xl font-medium text-white md:text-3xl">{content.hero.subtitle}</p>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-[#888888]">{content.hero.description}</p>
        </div>
      </section>

      <section className="border-t-4 border-[#CCFF00] px-4 py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-[#CCFF00]">[{content.mission.label}]</p>
            <h2 className="mb-6 text-5xl font-bold tracking-tighter md:text-7xl">
              <span className="text-white">{content.mission.title}</span>
              <br />
              <span className="text-[#CCFF00]">{content.mission.titleAccent}</span>
            </h2>
            <p className="text-lg leading-relaxed text-[#888888]">{content.mission.text}</p>
          </div>

          <div className="group relative aspect-square overflow-hidden border-4 border-[#CCFF00] bg-[#1a1a1a]">
            <Image
              src="https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=800&h=800&fit=crop"
              alt={content.imageAlt}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex items-center gap-2 text-[#CCFF00]">
              <Cpu className="h-5 w-5" />
              <span className="text-sm font-bold uppercase tracking-wider">{content.mission.badge}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t-4 border-[#1a1a1a] bg-[#0a0a0a] px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 text-center text-sm font-bold uppercase tracking-[0.3em] text-[#CCFF00]">[{content.features.label}]</p>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {features.map((feature) => {
              const Icon = iconMap[feature.icon]

              return (
                <div
                  key={feature.title}
                  className="group border-4 border-[#CCFF00] bg-[#0a0a0a] p-8 transition-all duration-300 hover:bg-[#CCFF00] hover:shadow-[0_0_40px_rgba(204,255,0,0.3)]"
                >
                  <div className="flex items-start gap-6">
                    <div className="border-2 border-[#CCFF00] p-4 transition-colors group-hover:border-[#0a0a0a] group-hover:bg-[#0a0a0a]">
                      <Icon className="h-8 w-8 text-[#CCFF00]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-3 text-xl font-bold uppercase tracking-wider text-white transition-colors group-hover:text-[#0a0a0a]">
                        {feature.title}
                      </h3>
                      <p className="leading-relaxed text-[#888888] transition-colors group-hover:text-[#0a0a0a]/70">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="border-t-4 border-[#CCFF00] bg-[#CCFF00] px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <p className="mb-12 text-center text-sm font-bold uppercase tracking-[0.3em] text-[#0a0a0a]">[{content.stats.label}]</p>

          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="mb-2 text-5xl font-bold tracking-tighter text-[#0a0a0a] md:text-7xl">{stat.value}</div>
                <div className="text-sm font-bold uppercase tracking-wider text-[#0a0a0a]/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t-4 border-[#CCFF00] bg-[#0a0a0a] px-4 py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <div className="border-4 border-[#CCFF00] bg-[#1a1a1a] p-8 font-mono">
              <div className="mb-6 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="ml-4 text-sm text-[#888888]">{content.tech.configFileName}</span>
              </div>
              <pre className="overflow-x-auto text-sm text-[#CCFF00]">{`const config = {
  name: "VIBE CHECK",
  version: "2.0.0",
  stack: [`}</pre>
              <div className="ml-4">
                {content.tech.stack.map((tech) => (
                  <div key={tech} className="text-sm">
                    <span className="text-[#888888]">    "</span>
                    <span className="text-white">{tech}</span>
                    <span className="text-[#888888]">",</span>
                  </div>
                ))}
              </div>
              <pre className="text-sm text-[#CCFF00]">{`  ],
  vibeLevel: "${content.tech.vibeLevel}",
};`}</pre>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-[#CCFF00]">[{content.tech.label}]</p>
            <h2 className="mb-6 text-5xl font-bold tracking-tighter md:text-6xl">
              <span className="text-white">{content.tech.title}</span>
              <br />
              <span className="text-[#CCFF00]">{content.tech.titleAccent}</span>
            </h2>
            <p className="text-lg leading-relaxed text-[#888888]">{content.tech.description}</p>
          </div>
        </div>
      </section>

      <section className="border-t-4 border-[#1a1a1a] px-4 py-24">
        <div className="mx-auto max-w-6xl text-center">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-[#CCFF00]">[{content.team.label}]</p>
          <h2 className="mb-6 text-5xl font-bold tracking-tighter md:text-7xl">
            <span className="text-white">{content.team.title}</span>
            <br />
            <span className="text-[#CCFF00]">{content.team.titleAccent}</span>
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-[#888888]">{content.team.description}</p>

          <div className="flex justify-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="border-4 border-[#CCFF00] bg-[#0a0a0a] p-4 text-[#CCFF00] transition-all hover:bg-[#CCFF00] hover:text-[#0a0a0a] hover:shadow-[0_0_30px_rgba(204,255,0,0.4)]"
              aria-label={content.social.github}
            >
              <Github className="h-6 w-6" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="border-4 border-[#CCFF00] bg-[#0a0a0a] p-4 text-[#CCFF00] transition-all hover:bg-[#CCFF00] hover:text-[#0a0a0a] hover:shadow-[0_0_30px_rgba(204,255,0,0.4)]"
              aria-label={content.social.twitter}
            >
              <Twitter className="h-6 w-6" />
            </a>
          </div>
        </div>
      </section>

      <section className="border-t-4 border-[#CCFF00] px-4 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-5xl font-bold tracking-tighter md:text-7xl">
            <span className="text-white">{content.cta.title}</span>
            <br />
            <span className="text-[#CCFF00]">{content.cta.titleAccent}</span>
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-lg text-[#888888]">{content.cta.description}</p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-3 border-4 border-[#CCFF00] bg-[#CCFF00] px-10 py-5 text-xl font-bold uppercase tracking-wider text-[#0a0a0a] transition-all hover:bg-[#0a0a0a] hover:text-[#CCFF00] hover:shadow-[0_0_40px_rgba(204,255,0,0.4)]"
          >
            <ShoppingBag className="h-6 w-6" />
            {content.cta.button}
            <ArrowRight className="h-6 w-6" />
          </Link>
        </div>
      </section>
    </div>
  )
}
