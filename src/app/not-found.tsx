"use client"

import Link from "next/link"
import { Home, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      {/* Scan lines background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, #CCFF00 2px, #CCFF00 4px)",
        }}
      />

      <div className="relative z-10 max-w-xl w-full text-center">
        {/* Glitch 404 */}
        <div className="relative mb-6">
          <h1
            className="text-[140px] md:text-[200px] font-bold text-[#CCFF00] leading-none tracking-tighter select-none"
            style={{
              textShadow:
                "4px 0 #ff0040, -4px 0 #00ffff, 0 0 40px rgba(204,255,0,0.3)",
              animation: "glitch-404 3s ease-in-out infinite",
            }}
          >
            404
          </h1>
          <div
            className="absolute inset-0 flex items-center justify-center text-[140px] md:text-[200px] font-bold text-[#CCFF00]/20 leading-none tracking-tighter select-none"
            style={{
              clipPath: "inset(45% 0 25% 0)",
              transform: "translate(5px, -3px)",
              animation: "glitch-404-slice 5s ease-in-out infinite",
            }}
          >
            404
          </div>
        </div>

        {/* Label */}
        <p className="text-[#CCFF00] text-sm font-bold uppercase tracking-[0.3em] mb-3 font-mono">
          [PAGE_NOT_FOUND]
        </p>
        <h2 className="text-white text-2xl md:text-3xl font-bold uppercase tracking-tight mb-4">
          LOST IN THE VOID
        </h2>
        <p className="text-[#888888] text-base font-mono mb-10 leading-relaxed max-w-md mx-auto">
          {
            "The page you're looking for doesn't exist or has been moved to another dimension."
          }
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className="flex items-center gap-3 px-8 py-4 bg-[#CCFF00] text-[#0a0a0a] font-bold uppercase tracking-wider border-4 border-[#CCFF00] hover:bg-[#0a0a0a] hover:text-[#CCFF00] transition-all hover:shadow-[0_0_20px_rgba(204,255,0,0.3)]"
          >
            <Home className="w-5 h-5" />
            GO HOME
          </Link>
          <Link
            href="/shop"
            className="flex items-center gap-3 px-8 py-4 bg-[#0a0a0a] text-[#CCFF00] font-bold uppercase tracking-wider border-4 border-[#CCFF00] hover:bg-[#CCFF00] hover:text-[#0a0a0a] transition-all hover:shadow-[0_0_20px_rgba(204,255,0,0.3)]"
          >
            <Search className="w-5 h-5" />
            BROWSE DROPS
          </Link>
        </div>

        {/* Decorative terminal line */}
        <div className="mt-12 font-mono text-xs text-[#CCFF00]/30 tracking-wider">
          {">"} vibe_check --find --path=void
          <span className="animate-pulse">_</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes glitch-404 {
          0%,
          100% {
            transform: translate(0);
          }
          15% {
            transform: translate(-4px, 2px);
          }
          35% {
            transform: translate(4px, -3px);
          }
          55% {
            transform: translate(-2px, -1px);
          }
          75% {
            transform: translate(3px, 2px);
          }
        }
        @keyframes glitch-404-slice {
          0%,
          100% {
            clip-path: inset(45% 0 25% 0);
            transform: translate(5px, -3px);
          }
          20% {
            clip-path: inset(15% 0 55% 0);
            transform: translate(-5px, 2px);
          }
          45% {
            clip-path: inset(55% 0 15% 0);
            transform: translate(4px, -1px);
          }
          70% {
            clip-path: inset(25% 0 45% 0);
            transform: translate(-3px, 3px);
          }
        }
      `}</style>
    </div>
  )
}
