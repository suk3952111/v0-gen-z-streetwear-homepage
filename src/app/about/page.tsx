"use client";

import Image from "next/image";
import Link from "next/link";
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
} from "lucide-react";
import { useLanguage, type Language } from "@/components/providers/language-provider";

type FeatureIcon = "eye" | "sparkles" | "zap" | "globe";

type AboutContent = {
  heroLabel: string;
  heroTitle: string;
  heroTitleAccent: string;
  heroSubtitle: string;
  heroDescription: string;
  missionLabel: string;
  missionTitle: string;
  missionTitleAccent: string;
  missionText: string;
  missionBadge: string;
  featuresLabel: string;
  features: Array<{
    icon: FeatureIcon;
    title: string;
    description: string;
  }>;
  techLabel: string;
  techTitle: string;
  techTitleAccent: string;
  techDescription: string;
  techStack: string[];
  techVibeLevel: string;
  statsLabel: string;
  stats: Array<{
    value: string;
    label: string;
  }>;
  teamLabel: string;
  teamTitle: string;
  teamTitleAccent: string;
  teamDescription: string;
  ctaTitle: string;
  ctaTitleAccent: string;
  ctaDescription: string;
  ctaButton: string;
};

const content: Record<Language, AboutContent> = {
  EN: {
    heroLabel: "WHO WE ARE",
    heroTitle: "VIBE",
    heroTitleAccent: "CHECK",
    heroSubtitle: "AI-curated streetwear for the next generation",
    heroDescription:
      "We blend fashion, culture, and machine intelligence to help people discover pieces that feel personal from the first click.",
    missionLabel: "OUR MISSION",
    missionTitle: "REDEFINING",
    missionTitleAccent: "STYLE",
    missionText:
      "Fashion should feel intuitive. Our platform reads your aesthetic, learns from your taste, and turns endless browsing into a sharper, faster way to build your wardrobe.",
    missionBadge: "AI-powered curation",
    featuresLabel: "WHAT WE DO",
    features: [
      {
        icon: "eye",
        title: "AI VISUAL SEARCH",
        description:
          "Upload a reference image and instantly surface similar pieces from the collection.",
      },
      {
        icon: "sparkles",
        title: "STYLE MATCHING",
        description:
          "Recommendations adapt to your preferences so every session gets more relevant.",
      },
      {
        icon: "zap",
        title: "SMART DROP ALERTS",
        description:
          "Stay ahead of launches with notifications tuned to the items you are actually likely to want.",
      },
      {
        icon: "globe",
        title: "GLOBAL ACCESS",
        description:
          "From Seoul to New York, we make it easy to discover and shop from anywhere.",
      },
    ],
    techLabel: "THE TECH",
    techTitle: "BUILT",
    techTitleAccent: "DIFFERENT",
    techDescription:
      "The experience is powered by modern commerce tooling and AI-assisted recommendation flows designed to understand aesthetics, not just clicks.",
    techStack: [
      "Next.js 16",
      "React 19",
      "Tailwind CSS",
      "Supabase",
      "AI Recommendations",
      "Global Commerce",
    ],
    techVibeLevel: "MAXIMUM",
    statsLabel: "BY THE NUMBERS",
    stats: [
      { value: "70+", label: "CURATED ITEMS" },
      { value: "98%", label: "MATCH CONFIDENCE" },
      { value: "24H", label: "FASTEST DELIVERY WINDOW" },
      { value: "GLOBAL", label: "COMMUNITY MINDSET" },
    ],
    teamLabel: "THE COLLECTIVE",
    teamTitle: "BUILT BY",
    teamTitleAccent: "CREATORS",
    teamDescription:
      "Designers, engineers, and streetwear fans working together to make discovery feel more human, more expressive, and much less noisy.",
    ctaTitle: "READY TO",
    ctaTitleAccent: "VIBE?",
    ctaDescription:
      "Explore the latest drops and find pieces that match your taste without the usual friction.",
    ctaButton: "EXPLORE DROPS",
  },
  KR: {
    heroLabel: "ABOUT US",
    heroTitle: "VIBE",
    heroTitleAccent: "CHECK",
    heroSubtitle: "AI가 제안하는 차세대 스트리트웨어 셀렉션",
    heroDescription:
      "패션과 문화, 그리고 AI를 연결해 처음부터 끝까지 내 취향에 맞는 아이템을 더 빠르고 선명하게 발견할 수 있도록 돕습니다.",
    missionLabel: "OUR MISSION",
    missionTitle: "스타일을",
    missionTitleAccent: "더 쉽게",
    missionText:
      "패션은 어렵지 않아야 합니다. 우리의 플랫폼은 사용자의 무드와 취향을 이해하고, 반복될수록 더 정교하게 학습해 긴 탐색 시간을 더 빠르고 만족스러운 발견 경험으로 바꿉니다.",
    missionBadge: "AI 큐레이션",
    featuresLabel: "WHAT WE DO",
    features: [
      {
        icon: "eye",
        title: "AI 비주얼 검색",
        description:
          "마음에 드는 이미지를 올리면 컬렉션 안에서 비슷한 무드의 아이템을 바로 찾아줍니다.",
      },
      {
        icon: "sparkles",
        title: "스타일 매칭",
        description:
          "추천은 취향에 맞춰 계속 진화하고, 사용할수록 더 정교하고 개인화됩니다.",
      },
      {
        icon: "zap",
        title: "스마트 드롭 알림",
        description:
          "정말 좋아할 만한 신상품만 빠르게 확인할 수 있도록 알림을 정교하게 설계했습니다.",
      },
      {
        icon: "globe",
        title: "글로벌 액세스",
        description:
          "서울에서 뉴욕까지, 어디서든 같은 감도로 아이템을 발견하고 쇼핑할 수 있습니다.",
      },
    ],
    techLabel: "THE TECH",
    techTitle: "기술을",
    techTitleAccent: "다르게 쌓다",
    techDescription:
      "단순한 클릭 데이터가 아니라 스타일의 결까지 읽어낼 수 있도록, 최신 커머스 기술과 AI 추천 흐름을 함께 설계했습니다.",
    techStack: [
      "Next.js 16",
      "React 19",
      "Tailwind CSS",
      "Supabase",
      "AI 추천",
      "글로벌 커머스",
    ],
    techVibeLevel: "HIGH",
    statsLabel: "BY THE NUMBERS",
    stats: [
      { value: "70+", label: "큐레이션 아이템" },
      { value: "98%", label: "매칭 신뢰도" },
      { value: "24H", label: "가장 빠른 배송 기준" },
      { value: "GLOBAL", label: "커뮤니티 감도" },
    ],
    teamLabel: "THE COLLECTIVE",
    teamTitle: "크리에이터가",
    teamTitleAccent: "함께 만듭니다",
    teamDescription:
      "디자이너, 엔지니어, 그리고 스트리트웨어를 사랑하는 사람들이 모여 더 감각적이고 더 사람다운 발견 경험을 만들고 있습니다.",
    ctaTitle: "지금",
    ctaTitleAccent: "확인해볼까요?",
    ctaDescription:
      "최신 드롭을 살펴보고, 복잡한 탐색 없이 내 취향에 맞는 아이템을 만나보세요.",
    ctaButton: "드롭 둘러보기",
  },
};

const iconMap = {
  eye: Eye,
  sparkles: Sparkles,
  zap: Zap,
  globe: Globe,
};

export default function AboutPage() {
  const { language } = useLanguage();
  const t = content[language];

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
          <p className="mb-6 text-sm font-bold uppercase tracking-[0.4em] text-[#CCFF00]">
            [{t.heroLabel}]
          </p>
          <h1 className="mb-6 text-7xl font-bold tracking-tighter md:text-9xl">
            <span className="text-white">{t.heroTitle}</span>
            <span className="text-[#CCFF00]">{t.heroTitleAccent}</span>
          </h1>
          <p className="mb-6 text-2xl font-medium text-white md:text-3xl">{t.heroSubtitle}</p>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-[#888888]">
            {t.heroDescription}
          </p>
        </div>
      </section>

      <section className="border-t-4 border-[#CCFF00] px-4 py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-[#CCFF00]">
              [{t.missionLabel}]
            </p>
            <h2 className="mb-6 text-5xl font-bold tracking-tighter md:text-7xl">
              <span className="text-white">{t.missionTitle}</span>
              <br />
              <span className="text-[#CCFF00]">{t.missionTitleAccent}</span>
            </h2>
            <p className="text-lg leading-relaxed text-[#888888]">{t.missionText}</p>
          </div>

          <div className="group relative aspect-square overflow-hidden border-4 border-[#CCFF00] bg-[#1a1a1a]">
            <Image
              src="https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=800&h=800&fit=crop"
              alt="Streetwear editorial styling"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex items-center gap-2 text-[#CCFF00]">
              <Cpu className="h-5 w-5" />
              <span className="text-sm font-bold uppercase tracking-wider">{t.missionBadge}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t-4 border-[#1a1a1a] bg-[#0a0a0a] px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 text-center text-sm font-bold uppercase tracking-[0.3em] text-[#CCFF00]">
            [{t.featuresLabel}]
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {t.features.map((feature) => {
              const Icon = iconMap[feature.icon];

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
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t-4 border-[#CCFF00] bg-[#CCFF00] px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <p className="mb-12 text-center text-sm font-bold uppercase tracking-[0.3em] text-[#0a0a0a]">
            [{t.statsLabel}]
          </p>

          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {t.stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="mb-2 text-5xl font-bold tracking-tighter text-[#0a0a0a] md:text-7xl">
                  {stat.value}
                </div>
                <div className="text-sm font-bold uppercase tracking-wider text-[#0a0a0a]/60">
                  {stat.label}
                </div>
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
                <span className="ml-4 text-sm text-[#888888]">vibe-check.config.ts</span>
              </div>
              <pre className="overflow-x-auto text-sm text-[#CCFF00]">{`const config = {
  name: "VIBE CHECK",
  version: "2.0.0",
  stack: [`}</pre>
              <div className="ml-4">
                {t.techStack.map((tech) => (
                  <div key={tech} className="text-sm">
                    <span className="text-[#888888]">    "</span>
                    <span className="text-white">{tech}</span>
                    <span className="text-[#888888]">",</span>
                  </div>
                ))}
              </div>
              <pre className="text-sm text-[#CCFF00]">{`  ],
  vibeLevel: "${t.techVibeLevel}",
};`}</pre>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-[#CCFF00]">
              [{t.techLabel}]
            </p>
            <h2 className="mb-6 text-5xl font-bold tracking-tighter md:text-6xl">
              <span className="text-white">{t.techTitle}</span>
              <br />
              <span className="text-[#CCFF00]">{t.techTitleAccent}</span>
            </h2>
            <p className="text-lg leading-relaxed text-[#888888]">{t.techDescription}</p>
          </div>
        </div>
      </section>

      <section className="border-t-4 border-[#1a1a1a] px-4 py-24">
        <div className="mx-auto max-w-6xl text-center">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-[#CCFF00]">
            [{t.teamLabel}]
          </p>
          <h2 className="mb-6 text-5xl font-bold tracking-tighter md:text-7xl">
            <span className="text-white">{t.teamTitle}</span>
            <br />
            <span className="text-[#CCFF00]">{t.teamTitleAccent}</span>
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-[#888888]">
            {t.teamDescription}
          </p>

          <div className="flex justify-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#0a0a0a] p-4 text-[#CCFF00] transition-all hover:bg-[#CCFF00] hover:text-[#0a0a0a] hover:shadow-[0_0_30px_rgba(204,255,0,0.4)] border-4 border-[#CCFF00]"
              aria-label="GitHub"
            >
              <Github className="h-6 w-6" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#0a0a0a] p-4 text-[#CCFF00] transition-all hover:bg-[#CCFF00] hover:text-[#0a0a0a] hover:shadow-[0_0_30px_rgba(204,255,0,0.4)] border-4 border-[#CCFF00]"
              aria-label="Twitter"
            >
              <Twitter className="h-6 w-6" />
            </a>
          </div>
        </div>
      </section>

      <section className="border-t-4 border-[#CCFF00] px-4 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-5xl font-bold tracking-tighter md:text-7xl">
            <span className="text-white">{t.ctaTitle}</span>
            <br />
            <span className="text-[#CCFF00]">{t.ctaTitleAccent}</span>
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-lg text-[#888888]">{t.ctaDescription}</p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-3 border-4 border-[#CCFF00] bg-[#CCFF00] px-10 py-5 text-xl font-bold uppercase tracking-wider text-[#0a0a0a] transition-all hover:bg-[#0a0a0a] hover:text-[#CCFF00] hover:shadow-[0_0_40px_rgba(204,255,0,0.4)]"
          >
            <ShoppingBag className="h-6 w-6" />
            {t.ctaButton}
            <ArrowRight className="h-6 w-6" />
          </Link>
        </div>
      </section>
    </div>
  );
}
