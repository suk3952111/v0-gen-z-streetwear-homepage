"use client"

import React from "react"

import { useState, useRef, useCallback } from "react"
import Image from "next/image"
import { X, Upload, Sparkles, ScanLine } from "lucide-react"

type Language = "EN" | "KR"

interface AIVisualSearchModalProps {
  isOpen: boolean
  onClose: () => void
  language: Language
}

const content = {
  EN: {
    title: "AI VISUAL SEARCH",
    subtitle: "Find your vibe",
    dropZone: "DROP YOUR VIBE",
    dropHint: "Drag & drop an image or click to upload",
    formats: "JPG, PNG, WEBP supported",
    scanning: "SCANNING VIBE...",
    detected: "DETECTED TAGS",
    results: "MATCHING RESULTS",
    viewProduct: "VIEW",
    noResults: "Upload an image to find matching products"
  },
  KR: {
    title: "AI 비주얼 검색",
    subtitle: "이미지로 찾는 나만의 바이브",
    dropZone: "이미지를 여기에 놓으세요",
    dropHint: "파일을 끌어다 놓거나 클릭하여 업로드",
    formats: "JPG, PNG, WEBP 지원",
    scanning: "바이브 분석 중...",
    detected: "감지된 키워드",
    results: "추천 매칭 결과",
    viewProduct: "상세보기",
    noResults: "이미지를 업로드하여 스타일을 분석해보세요"
  }
}

const mockTags = ["#Oversized", "#Neon", "#Street", "#Urban", "#Y2K", "#Cyber"]

const mockResults = [
  {
    name: "사이버 후디 3000",
    price: 189000,
    priceUSD: 189,
    aiMatch: 98,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop"
  },
  {
    name: "VOID PUFFER JACKET",
    price: 299000,
    priceUSD: 299,
    aiMatch: 92,
    image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400&h=400&fit=crop"
  },
  {
    name: "네온 오버사이즈 티",
    price: 79000,
    priceUSD: 79,
    aiMatch: 89,
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop"
  },
  {
    name: "PIXEL VARSITY JACKET",
    price: 265000,
    priceUSD: 265,
    aiMatch: 85,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop"
  },
  {
    name: "STATIC CREWNECK",
    price: 95000,
    priceUSD: 95,
    aiMatch: 82,
    image: "https://images.unsplash.com/photo-1578681994506-b8f463449011?w=400&h=400&fit=crop"
  },
  {
    name: "매트릭스 트랙팬츠",
    price: 120000,
    priceUSD: 120,
    aiMatch: 78,
    image: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=400&h=400&fit=crop"
  }
]

export function AIVisualSearchModal({ isOpen, onClose, language }: AIVisualSearchModalProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatPrice = (p: number, curr: string) => {
    if (curr === "KRW") {
      return `${p.toLocaleString()}원`
    }
    return `$${p}`
  }

  const handleFileUpload = useCallback((file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
        setIsScanning(true)
        setShowResults(false)
        
        // Simulate scanning
        setTimeout(() => {
          setIsScanning(false)
          setShowResults(true)
        }, 2500)
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
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Glassmorphism backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0a0a0a]/95 border-4 border-[#CCFF00] backdrop-blur-md scrollbar-hide">
        {/* Grainy texture overlay */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Header */}
        <div className="relative flex items-center justify-between p-6 border-b-4 border-[#CCFF00]">
          <div>
            <h2 id="modal-title" className="text-3xl md:text-4xl font-bold text-[#CCFF00] uppercase tracking-tighter">
              {content[language].title}
            </h2>
            <p className="text-white/70 text-sm font-bold uppercase tracking-wider mt-1">
              {content[language].subtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 border-4 border-[#CCFF00] text-[#CCFF00] hover:bg-[#CCFF00] hover:text-[#0a0a0a] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="relative p-6">
          {/* Upload Zone */}
          {!uploadedImage ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center min-h-[300px] border-4 border-dashed cursor-pointer transition-all ${
                isDragOver 
                  ? "border-[#CCFF00] bg-[#CCFF00]/10 shadow-[0_0_40px_#CCFF00_inset]" 
                  : "border-[#CCFF00]/50 hover:border-[#CCFF00] hover:bg-[#1a1a1a]"
              }`}
            >
              <div className="flex flex-col items-center gap-4 text-center p-8">
                <div 
                  className="p-6 border-4 border-[#CCFF00] text-[#CCFF00]"
                  style={{ 
                    animation: isDragOver ? 'pulse-glow 1s ease-in-out infinite' : 'none',
                    boxShadow: isDragOver ? '0 0 30px #CCFF00' : 'none'
                  }}
                >
                  <Upload className="w-12 h-12" />
                </div>
                <div>
                  <p className="text-2xl md:text-3xl font-bold text-[#CCFF00] uppercase tracking-tighter mb-2">
                    {content[language].dropZone}
                  </p>
                  <p className="text-white/70 text-sm font-medium uppercase tracking-wider mb-1">
                    {content[language].dropHint}
                  </p>
                  <p className="text-white/40 text-xs uppercase tracking-wider">
                    {content[language].formats}
                  </p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleInputChange}
                className="hidden"
                aria-label="Upload image"
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Uploaded Image with Scan Effect */}
              <div className="relative">
                <div className="relative aspect-video max-h-[300px] w-full overflow-hidden border-4 border-[#CCFF00]">
                  <Image
                    src={uploadedImage || "/placeholder.svg"}
                    alt="Uploaded image"
                    fill
                    className="object-contain bg-[#1a1a1a]"
                  />
                  
                  {/* Scanning laser line */}
                  {isScanning && (
                    <div 
                      className="absolute left-0 right-0 h-1 bg-[#CCFF00] z-20"
                      style={{
                        animation: 'scan-line 1.5s ease-in-out infinite',
                        boxShadow: '0 0 20px #CCFF00, 0 0 40px #CCFF00, 0 0 60px #CCFF00'
                      }}
                    />
                  )}
                  
                  {/* Scan overlay effect */}
                  {isScanning && (
                    <div className="absolute inset-0 bg-[#CCFF00]/5 animate-pulse z-10" />
                  )}
                </div>

                {/* Scanning Status */}
                {isScanning && (
                  <div className="flex items-center justify-center gap-3 mt-4 py-4 border-4 border-[#CCFF00] bg-[#0a0a0a]">
                    <ScanLine className="w-6 h-6 text-[#CCFF00] animate-pulse" />
                    <span className="text-[#CCFF00] text-lg font-bold uppercase tracking-wider animate-pulse">
                      {content[language].scanning}
                    </span>
                  </div>
                )}

                {/* Reset button */}
                <button
                  onClick={handleReset}
                  className="absolute top-4 right-4 p-2 border-4 border-[#CCFF00] bg-[#0a0a0a] text-[#CCFF00] hover:bg-[#CCFF00] hover:text-[#0a0a0a] transition-colors z-30"
                  aria-label="Upload new image"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Results Section */}
              {showResults && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Detected Tags */}
                  <div>
                    <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#CCFF00]" />
                      {content[language].detected}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {mockTags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 border-2 border-[#CCFF00] bg-[#CCFF00]/10 text-[#CCFF00] text-sm font-bold uppercase tracking-wider hover:bg-[#CCFF00] hover:text-[#0a0a0a] transition-colors cursor-pointer"
                          style={{
                            animation: `fade-in-tag 0.3s ease-out ${index * 0.1}s both`
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Matching Results */}
                  <div>
                    <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#CCFF00]" />
                      {content[language].results}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {mockResults.map((product, index) => (
                        <div
                          key={index}
                          className="group relative border-4 border-[#CCFF00] bg-[#0a0a0a] transition-all hover:translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_#CCFF00] cursor-pointer"
                          style={{
                            animation: `fade-in-result 0.4s ease-out ${index * 0.1}s both`
                          }}
                        >
                          {/* AI Match Badge */}
                          <div 
                            className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 bg-[#0a0a0a] border-2 border-[#CCFF00] text-[#CCFF00]"
                            style={{ animation: 'badge-glow 2s ease-in-out infinite' }}
                          >
                            <Sparkles className="w-3 h-3" />
                            <span className="text-xs font-bold">{product.aiMatch}%</span>
                          </div>

                          {/* Product Image */}
                          <div className="relative aspect-square overflow-hidden bg-[#1a1a1a]">
                            <Image
                              src={product.image || "/placeholder.svg"}
                              alt={product.name}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-[#CCFF00] opacity-0 group-hover:opacity-10 transition-opacity" />
                          </div>

                          {/* Product Info */}
                          <div className="p-3 border-t-4 border-[#CCFF00]">
                            <h4 className="text-white text-sm font-bold uppercase tracking-tight truncate mb-1">
                              {product.name}
                            </h4>
                            <div className="flex items-center justify-between">
                              <p className="text-[#CCFF00] font-bold">
                                {formatPrice(language === "KR" ? product.price : product.priceUSD, language === "KR" ? "KRW" : "USD")}
                              </p>
                              <span className="text-white/50 text-xs font-bold uppercase group-hover:text-[#CCFF00] transition-colors">
                                {content[language].viewProduct}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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
