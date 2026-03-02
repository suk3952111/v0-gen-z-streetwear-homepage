"use client"

import { useState } from "react"

interface GoogleOAuthButtonProps {
  label: string
  pending: boolean
  onClick: () => void
}

export function GoogleOAuthButton({ label, pending, onClick }: GoogleOAuthButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={pending}
      className="relative w-full py-3.5 bg-[#0a0a0a] text-[#CCFF00] text-base font-bold uppercase tracking-wider border-4 border-[#CCFF00] hover:bg-[#1a1a1a] transition-colors overflow-hidden"
    >
      <span className="inline-block">{label}</span>
      {isHovered && (
        <>
          <span
            className="absolute inset-0 flex items-center justify-center text-[#ff0000] opacity-70 font-bold uppercase tracking-wider"
            style={{ clipPath: "polygon(0 0, 100% 0, 100% 45%, 0 45%)", transform: "translate(-2px, 0)" }}
          >
            {label}
          </span>
          <span
            className="absolute inset-0 flex items-center justify-center text-[#00ffff] opacity-70 font-bold uppercase tracking-wider"
            style={{ clipPath: "polygon(0 55%, 100% 55%, 100% 100%, 0 100%)", transform: "translate(2px, 0)" }}
          >
            {label}
          </span>
        </>
      )}
    </button>
  )
}
