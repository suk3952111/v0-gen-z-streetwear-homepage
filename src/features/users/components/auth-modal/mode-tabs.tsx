"use client"

import type { AuthMode } from "./types"

interface ModeTabsProps {
  mode: AuthMode
  onChangeMode: (mode: AuthMode) => void
  loginLabel: string
  signupLabel: string
}

export function ModeTabs({ mode, onChangeMode, loginLabel, signupLabel }: ModeTabsProps) {
  return (
    <div className="flex mb-6 border-2 border-[#CCFF00]">
      <button
        onClick={() => onChangeMode("LOGIN")}
        className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${
          mode === "LOGIN" ? "bg-[#CCFF00] text-[#0a0a0a]" : "bg-[#0a0a0a] text-[#CCFF00] hover:bg-[#1a1a1a]"
        }`}
      >
        {loginLabel}
      </button>
      <button
        onClick={() => onChangeMode("SIGNUP")}
        className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors border-l-2 border-[#CCFF00] ${
          mode === "SIGNUP" ? "bg-[#CCFF00] text-[#0a0a0a]" : "bg-[#0a0a0a] text-[#CCFF00] hover:bg-[#1a1a1a]"
        }`}
      >
        {signupLabel}
      </button>
    </div>
  )
}
