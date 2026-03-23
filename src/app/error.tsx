"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, RotateCcw, Home } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"

const content = {
  EN: {
    badge: "[SYSTEM_FAILURE]",
    title: "SOMETHING WENT WRONG",
    description: "An unexpected error occurred while processing your request.",
    errorId: "ERROR_ID:",
    retry: "RETRY",
    goHome: "GO HOME",
  },
  KR: {
    badge: "[SYSTEM_FAILURE]",
    title: "문제가 발생했습니다",
    description: "요청을 처리하는 중 예상치 못한 오류가 발생했습니다.",
    errorId: "오류 ID:",
    retry: "다시 시도",
    goHome: "홈으로",
  },
} as const

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { language } = useLanguage()
  const t = content[language]

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, #CCFF00 2px, #CCFF00 4px)",
        }}
      />

      <div className="relative z-10 max-w-xl w-full text-center">
        <div className="relative mb-6">
          <h1
            className="text-[120px] md:text-[180px] font-bold text-[#CCFF00] leading-none tracking-tighter select-none"
            style={{
              textShadow:
                "4px 0 #ff0040, -4px 0 #00ffff, 0 0 40px rgba(204,255,0,0.3)",
              animation: "glitch-text 3s ease-in-out infinite",
            }}
          >
            ERR
          </h1>
          <div
            className="absolute inset-0 flex items-center justify-center text-[120px] md:text-[180px] font-bold text-[#CCFF00]/20 leading-none tracking-tighter select-none"
            style={{
              clipPath: "inset(40% 0 30% 0)",
              transform: "translate(6px, -2px)",
              animation: "glitch-slice 4s ease-in-out infinite",
            }}
          >
            ERR
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <div
            className="p-4 border-4 border-[#CCFF00] bg-[#0a0a0a]"
            style={{ animation: "badge-glow 2s ease-in-out infinite" }}
          >
            <AlertTriangle className="w-10 h-10 text-[#CCFF00]" />
          </div>
        </div>

        <p className="text-[#CCFF00] text-sm font-bold uppercase tracking-[0.3em] mb-3 font-mono">
          {t.badge}
        </p>
        <h2 className="text-white text-2xl md:text-3xl font-bold uppercase tracking-tight mb-4">
          {t.title}
        </h2>
        <p className="text-[#888888] text-base font-mono mb-2 leading-relaxed">{t.description}</p>
        {error.digest && (
          <p className="text-[#888888]/50 text-xs font-mono mb-8">
            {t.errorId} {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
          <button
            onClick={reset}
            className="flex items-center gap-3 px-8 py-4 bg-[#CCFF00] text-[#0a0a0a] font-bold uppercase tracking-wider border-4 border-[#CCFF00] hover:bg-[#0a0a0a] hover:text-[#CCFF00] transition-all hover:shadow-[0_0_20px_rgba(204,255,0,0.3)]"
          >
            <RotateCcw className="w-5 h-5" />
            {t.retry}
          </button>
          <Link
            href="/"
            className="flex items-center gap-3 px-8 py-4 bg-[#0a0a0a] text-[#CCFF00] font-bold uppercase tracking-wider border-4 border-[#CCFF00] hover:bg-[#CCFF00] hover:text-[#0a0a0a] transition-all hover:shadow-[0_0_20px_rgba(204,255,0,0.3)]"
          >
            <Home className="w-5 h-5" />
            {t.goHome}
          </Link>
        </div>

        <div className="mt-12 font-mono text-xs text-[#CCFF00]/30 tracking-wider">
          {">"} vibe_check --recover --force
          <span className="animate-pulse">_</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes glitch-text {
          0%,
          100% {
            transform: translate(0);
          }
          20% {
            transform: translate(-3px, 2px);
          }
          40% {
            transform: translate(3px, -2px);
          }
          60% {
            transform: translate(-2px, -1px);
          }
          80% {
            transform: translate(2px, 1px);
          }
        }
        @keyframes glitch-slice {
          0%,
          100% {
            clip-path: inset(40% 0 30% 0);
            transform: translate(6px, -2px);
          }
          25% {
            clip-path: inset(20% 0 50% 0);
            transform: translate(-4px, 3px);
          }
          50% {
            clip-path: inset(60% 0 10% 0);
            transform: translate(5px, -1px);
          }
          75% {
            clip-path: inset(30% 0 40% 0);
            transform: translate(-3px, 2px);
          }
        }
      `}</style>
    </div>
  )
}
