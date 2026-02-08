"use client"

import { useEffect, useCallback } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X, Star } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export interface FocusImage {
  id: string
  src: string
  alt: string
  type: "product" | "review"
  reviewContext?: {
    username: string
    rating: number
    content: string
  }
}

interface ImageFocusModalProps {
  images: FocusImage[]
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  onNavigate: (index: number) => void
}

export function ImageFocusModal({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}: ImageFocusModalProps) {
  const currentImage = images[currentIndex]

  const goNext = useCallback(() => {
    if (currentIndex < images.length - 1) {
      onNavigate(currentIndex + 1)
    }
  }, [currentIndex, images.length, onNavigate])

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1)
    }
  }, [currentIndex, onNavigate])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose()
          break
        case "ArrowRight":
          goNext()
          break
        case "ArrowLeft":
          goPrev()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden"

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [isOpen, onClose, goNext, goPrev])

  return (
    <AnimatePresence>
      {isOpen && currentImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          onClick={onClose}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ backdropFilter: "blur(0px)" }}
            animate={{ backdropFilter: "blur(24px)" }}
            exit={{ backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/60"
          />

          {/* Close Button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.1 }}
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="absolute top-6 right-6 z-10 p-3 bg-[#0a0a0a] border-2 border-[#CCFF00] text-[#CCFF00] hover:bg-[#CCFF00] hover:text-[#0a0a0a] transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </motion.button>

          {/* Previous Button */}
          {currentIndex > 0 && (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: 0.15 }}
              onClick={(e) => {
                e.stopPropagation()
                goPrev()
              }}
              className="absolute left-4 md:left-8 z-10 p-3 md:p-4 bg-[#0a0a0a]/80 border-2 border-[#CCFF00] text-[#CCFF00] hover:bg-[#CCFF00] hover:text-[#0a0a0a] transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
            </motion.button>
          )}

          {/* Next Button */}
          {currentIndex < images.length - 1 && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: 0.15 }}
              onClick={(e) => {
                e.stopPropagation()
                goNext()
              }}
              className="absolute right-4 md:right-8 z-10 p-3 md:p-4 bg-[#0a0a0a]/80 border-2 border-[#CCFF00] text-[#CCFF00] hover:bg-[#CCFF00] hover:text-[#0a0a0a] transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
            </motion.button>
          )}

          {/* Main Image Container */}
          <div
            className="relative z-[1] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              layoutId={`focus-image-${currentImage.id}`}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className="relative border-4 border-[#CCFF00] overflow-hidden shadow-[0_0_60px_rgba(204,255,0,0.15)]"
              style={{
                width: "min(85vw, 800px)",
                height: "min(70vh, 800px)",
              }}
            >
              <Image
                src={currentImage.src || "/placeholder.svg"}
                alt={currentImage.alt}
                fill
                className="object-cover"
                sizes="(max-width: 800px) 85vw, 800px"
                priority
              />

              {/* Scan line overlay for product images */}
              {currentImage.type === "product" && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div
                    className="absolute left-0 right-0 h-[2px] bg-[#CCFF00]/30"
                    style={{ animation: "scan-line 4s ease-in-out infinite" }}
                  />
                </div>
              )}
            </motion.div>

            {/* Review Context Overlay */}
            <AnimatePresence mode="wait">
              {currentImage.type === "review" && currentImage.reviewContext && (
                <motion.div
                  key={`review-ctx-${currentImage.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="mt-4 p-4 md:p-5 bg-[#0a0a0a]/90 border-2 border-[#CCFF00] backdrop-blur-sm"
                  style={{ width: "min(85vw, 800px)" }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[#CCFF00] font-bold text-sm uppercase tracking-wider">
                      {currentImage.reviewContext.username}
                    </span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= currentImage.reviewContext!.rating
                              ? "text-[#CCFF00] fill-[#CCFF00]"
                              : "text-[#333333]"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-white/80 text-sm leading-relaxed line-clamp-3">
                    {currentImage.reviewContext.content}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pagination Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-4 flex items-center gap-4"
            >
              <span className="text-[#CCFF00] font-bold text-lg tracking-wider font-mono">
                {currentIndex + 1} / {images.length}
              </span>

              {/* Dot indicators */}
              <div className="flex gap-1.5">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation()
                      onNavigate(idx)
                    }}
                    className={`w-2 h-2 transition-all ${
                      idx === currentIndex
                        ? "bg-[#CCFF00] scale-125"
                        : "bg-[#CCFF00]/30 hover:bg-[#CCFF00]/60"
                    }`}
                    aria-label={`Go to image ${idx + 1}`}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
