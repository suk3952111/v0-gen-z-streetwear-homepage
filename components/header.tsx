"use client"

import Link from "next/link"
import { ShoppingBag, Menu, X } from "lucide-react"
import { useState, createContext, useContext } from "react"

type Language = "EN" | "KR"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
}

export const LanguageContext = createContext<LanguageContextType>({
  language: "EN",
  setLanguage: () => {},
})

export function useLanguage() {
  return useContext(LanguageContext)
}

export function Header({ language, onLanguageChange }: { language: Language; onLanguageChange: (lang: Language) => void }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const navItems = {
    EN: { drops: "DROPS", archive: "ARCHIVE", about: "ABOUT" },
    KR: { drops: "신상품", archive: "아카이브", about: "소개" },
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b-4 border-[#CCFF00] bg-[#0a0a0a]">
      <div className="flex items-center justify-between px-4 py-4 md:px-8">
        <Link href="/" className="text-3xl md:text-4xl font-bold text-[#CCFF00] tracking-tighter hover:text-white transition-colors">
          VIBE CHECK
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#" className="text-white text-lg font-bold uppercase tracking-wider hover:text-[#CCFF00] transition-colors border-b-2 border-transparent hover:border-[#CCFF00]">
            {navItems[language].drops}
          </Link>
          <Link href="#" className="text-white text-lg font-bold uppercase tracking-wider hover:text-[#CCFF00] transition-colors border-b-2 border-transparent hover:border-[#CCFF00]">
            {navItems[language].archive}
          </Link>
          <Link href="#" className="text-white text-lg font-bold uppercase tracking-wider hover:text-[#CCFF00] transition-colors border-b-2 border-transparent hover:border-[#CCFF00]">
            {navItems[language].about}
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <div className="flex border-2 border-[#CCFF00]">
            <button
              onClick={() => onLanguageChange("EN")}
              className={`px-3 py-1.5 text-sm font-bold uppercase tracking-wider transition-colors ${
                language === "EN"
                  ? "bg-[#CCFF00] text-[#0a0a0a]"
                  : "bg-[#0a0a0a] text-[#CCFF00] hover:bg-[#1a1a1a]"
              }`}
              aria-label="Switch to English"
            >
              EN
            </button>
            <button
              onClick={() => onLanguageChange("KR")}
              className={`px-3 py-1.5 text-sm font-bold uppercase tracking-wider transition-colors border-l-2 border-[#CCFF00] ${
                language === "KR"
                  ? "bg-[#CCFF00] text-[#0a0a0a]"
                  : "bg-[#0a0a0a] text-[#CCFF00] hover:bg-[#1a1a1a]"
              }`}
              aria-label="Switch to Korean"
            >
              KR
            </button>
          </div>

          <button 
            className="relative p-2 border-2 border-[#CCFF00] bg-[#0a0a0a] text-[#CCFF00] hover:bg-[#CCFF00] hover:text-[#0a0a0a] transition-colors"
            aria-label="Shopping bag"
          >
            <ShoppingBag className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#CCFF00] text-[#0a0a0a] text-xs font-bold flex items-center justify-center">
              3
            </span>
          </button>
          
          <button 
            className="md:hidden p-2 border-2 border-[#CCFF00] bg-[#0a0a0a] text-[#CCFF00]"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="md:hidden border-t-2 border-[#CCFF00] bg-[#0a0a0a]">
          <Link href="#" className="block px-4 py-4 text-white text-xl font-bold uppercase border-b-2 border-[#1a1a1a] hover:bg-[#CCFF00] hover:text-[#0a0a0a] transition-colors">
            {navItems[language].drops}
          </Link>
          <Link href="#" className="block px-4 py-4 text-white text-xl font-bold uppercase border-b-2 border-[#1a1a1a] hover:bg-[#CCFF00] hover:text-[#0a0a0a] transition-colors">
            {navItems[language].archive}
          </Link>
          <Link href="#" className="block px-4 py-4 text-white text-xl font-bold uppercase hover:bg-[#CCFF00] hover:text-[#0a0a0a] transition-colors">
            {navItems[language].about}
          </Link>
        </nav>
      )}
    </header>
  )
}
