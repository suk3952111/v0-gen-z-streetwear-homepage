"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type Language = "EN" | "KR"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("EN")
  const [mounted, setMounted] = useState(false)

  // Load saved language preference on mount
  useEffect(() => {
    const saved = localStorage.getItem("vibe-check-lang") as Language | null
    if (saved && (saved === "EN" || saved === "KR")) {
      setLanguage(saved)
    }
    setMounted(true)
  }, [])

  // Save language preference when it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("vibe-check-lang", language)
    }
  }, [language, mounted])

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage: () => setLanguage((prev) => (prev === "EN" ? "KR" : "EN")),
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
