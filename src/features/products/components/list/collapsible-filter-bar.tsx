"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Search, X, ChevronUp, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { categories, categoryMap, allTags, type Language } from "@/lib/products"

interface CollapsibleFilterBarProps {
  language: Language
  searchQuery: string
  onSearchChange: (query: string) => void
  activeCategory: string
  onCategoryChange: (category: string) => void
  activeTags: string[]
  onToggleTag: (tag: string) => void
  content: {
    title: string
    subtitle: string
    searchPlaceholder: string
  }
}

export function CollapsibleFilterBar({
  language,
  searchQuery,
  onSearchChange,
  activeCategory,
  onCategoryChange,
  activeTags,
  onToggleTag,
  content,
}: CollapsibleFilterBarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [manualOverride, setManualOverride] = useState<boolean | null>(null)
  const lastScrollY = useRef(0)
  const scrollThreshold = 120

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY

    if (manualOverride !== null) {
      // If user manually toggled, keep that state until they scroll past threshold in the opposite direction
      if (manualOverride && currentScrollY < 50) {
        // User manually expanded and scrolled back to top - release override
        setManualOverride(null)
      } else if (!manualOverride && currentScrollY > lastScrollY.current + 80) {
        // User manually collapsed and kept scrolling down - release override
        setManualOverride(null)
      }
      lastScrollY.current = currentScrollY
      return
    }

    if (currentScrollY > scrollThreshold && currentScrollY > lastScrollY.current) {
      setIsCollapsed(true)
    } else if (currentScrollY < scrollThreshold) {
      setIsCollapsed(false)
    }

    lastScrollY.current = currentScrollY
  }, [manualOverride])

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  const toggleManual = () => {
    const newState = manualOverride !== null ? !manualOverride : !isCollapsed
    setManualOverride(newState)
    setIsCollapsed(newState)
  }

  const collapsed = manualOverride !== null ? manualOverride : isCollapsed

  return (
    <motion.div
      className="sticky top-[73px] z-40 bg-[#0a0a0a] border-b-4 border-[#CCFF00]"
      initial={false}
      animate={{
        paddingTop: collapsed ? 8 : 24,
        paddingBottom: collapsed ? 8 : 24,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Page Title - hidden when collapsed */}
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              className="mb-6 overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <p className="text-[#CCFF00] text-sm font-bold uppercase tracking-[0.3em] mb-2">
                {content.subtitle}
              </p>
              <h1 className="text-4xl md:text-6xl font-bold text-white uppercase tracking-tighter">
                {content.title}
              </h1>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Bar - shrinks when collapsed */}
        <motion.div
          className="relative"
          animate={{ marginBottom: collapsed ? 8 : 24 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <Search
            className={`absolute left-4 top-1/2 -translate-y-1/2 text-[#CCFF00] transition-all duration-300 ${
              collapsed ? "w-5 h-5" : "w-6 h-6"
            }`}
          />
          <motion.input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={content.searchPlaceholder}
            className="w-full bg-[#0a0a0a] border-4 border-[#CCFF00] text-white font-mono uppercase tracking-wider placeholder:text-[#888888] focus:outline-none focus:shadow-[0_0_20px_#CCFF00]"
            animate={{
              paddingLeft: collapsed ? 44 : 56,
              paddingRight: 48,
              paddingTop: collapsed ? 10 : 16,
              paddingBottom: collapsed ? 10 : 16,
              fontSize: collapsed ? 14 : 18,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#CCFF00] hover:text-white transition-colors"
            >
              <X className={`transition-all duration-300 ${collapsed ? "w-5 h-5" : "w-6 h-6"}`} />
            </button>
          )}
        </motion.div>

        {/* Category Tabs - horizontal scroll when collapsed, wrap when expanded */}
        <motion.div
          className={`${
            collapsed
              ? "flex gap-2 overflow-x-auto scrollbar-hide pb-1"
              : "flex flex-wrap gap-2 mb-4"
          }`}
          animate={{ marginBottom: collapsed ? 8 : 16 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={collapsed ? { scrollbarWidth: "none", msOverflowStyle: "none" } : {}}
        >
          {categories[language].map((cat) => {
            const catKey = categoryMap[cat] || cat
            const isActive = activeCategory === catKey
            return (
              <motion.button
                key={cat}
                onClick={() => onCategoryChange(catKey)}
                className={`font-bold uppercase tracking-wider border-4 transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-[#CCFF00] text-[#0a0a0a] border-[#CCFF00]"
                    : "bg-[#0a0a0a] text-[#CCFF00] border-[#CCFF00] hover:bg-[#1a1a1a]"
                }`}
                animate={{
                  paddingLeft: collapsed ? 12 : 20,
                  paddingRight: collapsed ? 12 : 20,
                  paddingTop: collapsed ? 6 : 12,
                  paddingBottom: collapsed ? 6 : 12,
                  fontSize: collapsed ? 12 : 14,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                [{cat}]
              </motion.button>
            )
          })}
        </motion.div>

        {/* Tag Filters - horizontal scroll when collapsed, wrap when expanded */}
        <motion.div
          className={`${
            collapsed
              ? "flex gap-2 overflow-x-auto scrollbar-hide"
              : "flex flex-wrap gap-2"
          }`}
          style={collapsed ? { scrollbarWidth: "none", msOverflowStyle: "none" } : {}}
        >
          {allTags.map((tag) => {
            const isActive = activeTags.includes(tag)
            return (
              <motion.button
                key={tag}
                onClick={() => onToggleTag(tag)}
                className={`font-bold uppercase tracking-wider border-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-[#CCFF00] text-[#0a0a0a] border-[#CCFF00] shadow-[0_0_10px_#CCFF00]"
                    : "bg-[#0a0a0a] text-[#888888] border-[#888888] hover:border-[#CCFF00] hover:text-[#CCFF00]"
                }`}
                animate={{
                  paddingLeft: collapsed ? 8 : 12,
                  paddingRight: collapsed ? 8 : 12,
                  paddingTop: collapsed ? 4 : 6,
                  paddingBottom: collapsed ? 4 : 6,
                  fontSize: collapsed ? 10 : 12,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {tag}
              </motion.button>
            )
          })}
        </motion.div>
      </div>

      {/* Manual Toggle Button */}
      <button
        onClick={toggleManual}
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-50 w-8 h-8 bg-[#0a0a0a] border-2 border-[#CCFF00] text-[#CCFF00] flex items-center justify-center hover:bg-[#CCFF00] hover:text-[#0a0a0a] transition-colors"
        aria-label={collapsed ? "Expand filter bar" : "Collapse filter bar"}
      >
        <motion.div
          animate={{ rotate: collapsed ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <ChevronUp className="w-4 h-4" />
        </motion.div>
      </button>

      {/* Hide scrollbar for webkit browsers */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </motion.div>
  )
}
