"use client"

import { Sparkles } from "lucide-react"

type Language = "EN" | "KR"

const buttonText = {
  EN: "AI STYLE FINDER",
  KR: "AI 스타일 찾기"
}

export function AIStyleFinder({ language }: { language: Language }) {
  return (
    <button
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-6 py-4 bg-[#0a0a0a] text-[#CCFF00] font-bold uppercase tracking-wider border-4 border-[#CCFF00] hover:bg-[#CCFF00] hover:text-[#0a0a0a] transition-colors"
      style={{
        animation: 'pulse-glow 2s ease-in-out infinite'
      }}
      aria-label={buttonText[language]}
    >
      <Sparkles className="w-5 h-5" />
      <span className="hidden sm:inline">{buttonText[language]}</span>
      <span className="sm:hidden">AI</span>
    </button>
  )
}
