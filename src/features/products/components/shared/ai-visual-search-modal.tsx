"use client"

import React from "react"
import { useState, useRef, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { X, Upload, Sparkles, ScanLine } from "lucide-react"
import { useI18n } from "@/lib/i18n/use-i18n"
import { formatPriceByCurrency } from "@/lib/format/currency"
import { findStyleByImageAction } from "@/features/products/actions/find-style-by-image"
import type { ShopProductItem } from "@/features/products/types/shop"

interface AIVisualSearchModalProps {
  isOpen: boolean
  onClose: () => void
  language?: "EN" | "KR"
}

export function AIVisualSearchModal({ isOpen, onClose }: AIVisualSearchModalProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [detectedTags, setDetectedTags] = useState<string[]>([])
  const [results, setResults] = useState<ShopProductItem[]>([])
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { locale, t } = useI18n("products.visualSearch")
  const bestMatchLabel = locale === "KR" ? "가장 비슷한 상품" : "BEST MATCHES"
  const similarMoodLabel = locale === "KR" ? "비슷한 무드" : "SIMILAR MOOD"
  const groupedResults = React.useMemo(() => {
    const bestMatches = results.filter((product, index) => product.aiMatch >= 70 || index < 3)
    const bestIds = new Set(bestMatches.map((product) => product.id))
    const similarMood = results.filter((product) => !bestIds.has(product.id))

    return {
      bestMatches,
      similarMood,
    }
  }, [results])

  const handleFileUpload = useCallback((file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string
        if (!dataUrl) return
        setUploadedImage(dataUrl)
        setIsScanning(true)
        setShowResults(false)
        setHasError(false)
        setErrorMessage("")
        setDetectedTags([])
        setResults([])

        const startedAt = Date.now()
        const response = await findStyleByImageAction({
          imageDataUrl: dataUrl,
          limit: 6,
        })
        const elapsed = Date.now() - startedAt
        const waitMs = Math.max(0, 1200 - elapsed)

        setTimeout(() => {
          setIsScanning(false)
          setShowResults(true)
          if (!response.success) {
            setHasError(true)
            setErrorMessage(response.errorMessage ?? "AI search failed.")
            return
          }
          setDetectedTags(response.data.detectedTags)
          setResults(response.data.products)
        }, waitMs)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileUpload(file)
  }, [handleFileUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileUpload(file)
  }, [handleFileUpload])

  const handleReset = useCallback(() => {
    setUploadedImage(null)
    setIsScanning(false)
    setShowResults(false)
    setHasError(false)
    setErrorMessage("")
    setDetectedTags([])
    setResults([])
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />

      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0a0a0a]/95 border-4 border-[#CCFF00] backdrop-blur-md scrollbar-hide">
        <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

        <div className="relative flex items-center justify-between p-6 border-b-4 border-[#CCFF00]">
          <div>
            <h2 id="modal-title" className="text-3xl md:text-4xl font-bold text-[#CCFF00] uppercase tracking-tighter">{t("title")}</h2>
            <p className="text-white/70 text-sm font-bold uppercase tracking-wider mt-1">{t("subtitle")}</p>
          </div>
          <button onClick={onClose} className="p-3 border-4 border-[#CCFF00] text-[#CCFF00] hover:bg-[#CCFF00] hover:text-[#0a0a0a] transition-colors" aria-label="Close modal">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="relative p-6">
          {!uploadedImage ? (
            <div onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onClick={() => fileInputRef.current?.click()} className={`relative flex flex-col items-center justify-center min-h-[300px] border-4 border-dashed cursor-pointer transition-all ${isDragOver ? "border-[#CCFF00] bg-[#CCFF00]/10 shadow-[0_0_40px_#CCFF00_inset]" : "border-[#CCFF00]/50 hover:border-[#CCFF00] hover:bg-[#1a1a1a]"}`}>
              <div className="flex flex-col items-center gap-4 text-center p-8">
                <div className="p-6 border-4 border-[#CCFF00] text-[#CCFF00]" style={{ animation: isDragOver ? "pulse-glow 1s ease-in-out infinite" : "none", boxShadow: isDragOver ? "0 0 30px #CCFF00" : "none" }}>
                  <Upload className="w-12 h-12" />
                </div>
                <div>
                  <p className="text-2xl md:text-3xl font-bold text-[#CCFF00] uppercase tracking-tighter mb-2">{t("dropZone")}</p>
                  <p className="text-white/70 text-sm font-medium uppercase tracking-wider mb-1">{t("dropHint")}</p>
                  <p className="text-white/40 text-xs uppercase tracking-wider">{t("formats")}</p>
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleInputChange} className="hidden" aria-label="Upload image" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative">
                <div className="relative aspect-video max-h-[300px] w-full overflow-hidden border-4 border-[#CCFF00]">
                  <Image src={uploadedImage || "/placeholder.svg"} alt="Uploaded image" fill className="object-contain bg-[#1a1a1a]" />

                  {isScanning && <div className="absolute left-0 right-0 h-1 bg-[#CCFF00] z-20" style={{ animation: "scan-line 1.5s ease-in-out infinite", boxShadow: "0 0 20px #CCFF00, 0 0 40px #CCFF00, 0 0 60px #CCFF00" }} />}
                  {isScanning && <div className="absolute inset-0 bg-[#CCFF00]/5 animate-pulse z-10" />}
                </div>

                {isScanning && (
                  <div className="flex items-center justify-center gap-3 mt-4 py-4 border-4 border-[#CCFF00] bg-[#0a0a0a]">
                    <ScanLine className="w-6 h-6 text-[#CCFF00] animate-pulse" />
                    <span className="text-[#CCFF00] text-lg font-bold uppercase tracking-wider animate-pulse">{t("scanning")}</span>
                  </div>
                )}

                <button onClick={handleReset} className="absolute top-4 right-4 p-2 border-4 border-[#CCFF00] bg-[#0a0a0a] text-[#CCFF00] hover:bg-[#CCFF00] hover:text-[#0a0a0a] transition-colors z-30" aria-label="Upload new image">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {showResults && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div>
                    <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5 text-[#CCFF00]" />{t("detected")}</h3>
                    <div className="flex flex-wrap gap-2">
                      {detectedTags.map((tag, index) => (
                        <span key={index} className="px-4 py-2 border-2 border-[#CCFF00] bg-[#CCFF00]/10 text-[#CCFF00] text-sm font-bold uppercase tracking-wider hover:bg-[#CCFF00] hover:text-[#0a0a0a] transition-colors cursor-pointer" style={{ animation: `fade-in-tag 0.3s ease-out ${index * 0.1}s both` }}>{tag}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5 text-[#CCFF00]" />{t("results")}</h3>
                    {hasError ? (
                      <p className="text-[#ff6666] text-sm uppercase tracking-wider">
                        {errorMessage}
                      </p>
                    ) : (
                      <div className="space-y-8">
                        {groupedResults.bestMatches.length > 0 && (
                          <div>
                            <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-[#CCFF00]">
                              {bestMatchLabel}
                            </p>
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                              {groupedResults.bestMatches.map((product, index) => (
                                <Link key={product.id} href={`/product/${product.id}`} onClick={onClose} className="group relative border-4 border-[#CCFF00] bg-[#0a0a0a] transition-all hover:translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_#CCFF00] cursor-pointer block" style={{ animation: `fade-in-result 0.4s ease-out ${index * 0.1}s both` }}>
                                  <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 bg-[#0a0a0a] border-2 border-[#CCFF00] text-[#CCFF00]" style={{ animation: "badge-glow 2s ease-in-out infinite" }}>
                                    <Sparkles className="w-3 h-3" />
                                    <span className="text-xs font-bold">{product.aiMatch}%</span>
                                  </div>

                                  <div className="relative aspect-square overflow-hidden bg-[#1a1a1a]">
                                    <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-[#CCFF00] opacity-0 group-hover:opacity-10 transition-opacity" />
                                  </div>

                                  <div className="p-3 border-t-4 border-[#CCFF00]">
                                    <h4 className="text-white text-sm font-bold uppercase tracking-tight truncate mb-1">{product.name}</h4>
                                    <div className="flex items-center justify-between">
                                      <p className="text-[#CCFF00] font-bold">{formatPriceByCurrency(locale === "KR" ? product.priceKRW : product.priceUSD, locale === "KR" ? "KRW" : "USD")}</p>
                                      <span className="text-white/50 text-xs font-bold uppercase group-hover:text-[#CCFF00] transition-colors">{t("viewProduct")}</span>
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}

                        {groupedResults.similarMood.length > 0 && (
                          <div>
                            <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-white/60">
                              {similarMoodLabel}
                            </p>
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                              {groupedResults.similarMood.map((product, index) => (
                                <Link key={product.id} href={`/product/${product.id}`} onClick={onClose} className="group relative border-4 border-[#333333] bg-[#0a0a0a] transition-all hover:border-[#CCFF00] hover:translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_#CCFF00] cursor-pointer block" style={{ animation: `fade-in-result 0.4s ease-out ${index * 0.1}s both` }}>
                                  <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 bg-[#0a0a0a] border-2 border-[#333333] text-white/80">
                                    <Sparkles className="w-3 h-3" />
                                    <span className="text-xs font-bold">{product.aiMatch}%</span>
                                  </div>

                                  <div className="relative aspect-square overflow-hidden bg-[#1a1a1a]">
                                    <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-[#CCFF00] opacity-0 group-hover:opacity-10 transition-opacity" />
                                  </div>

                                  <div className="p-3 border-t-4 border-[#333333] group-hover:border-[#CCFF00]">
                                    <h4 className="text-white text-sm font-bold uppercase tracking-tight truncate mb-1">{product.name}</h4>
                                    <div className="flex items-center justify-between">
                                      <p className="text-[#CCFF00] font-bold">{formatPriceByCurrency(locale === "KR" ? product.priceKRW : product.priceUSD, locale === "KR" ? "KRW" : "USD")}</p>
                                      <span className="text-white/50 text-xs font-bold uppercase group-hover:text-[#CCFF00] transition-colors">{t("viewProduct")}</span>
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
