"use client"

import { useMemo } from "react"
import { useLanguage } from "@/components/providers/language-provider"
import { messages } from "./messages"
import type { Locale, MessageNode } from "./types"

function getByPath(obj: MessageNode, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)
}

function interpolate(text: string, vars?: Record<string, string | number>): string {
  if (!vars) return text
  return text.replace(/\{(\w+)\}/g, (_, token: string) => String(vars[token] ?? `{${token}}`))
}

export function useI18n(namespace?: string) {
  const { language, setLanguage } = useLanguage()

  const t = useMemo(() => {
    return (key: string, vars?: Record<string, string | number>): string => {
      const fullKey = namespace ? `${namespace}.${key}` : key
      const current = getByPath(messages[language as Locale], fullKey)
      const fallback = getByPath(messages.EN, fullKey)
      const raw = (current ?? fallback ?? fullKey) as string
      return interpolate(raw, vars)
    }
  }, [language, namespace])

  return {
    locale: language as Locale,
    setLocale: (next: Locale) => setLanguage(next),
    t,
  }
}

