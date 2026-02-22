"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface WishlistItem {
  id: string
  product_id: string
  created_at: string
}

interface WishlistContextType {
  wishlist: WishlistItem[]
  addToWishlist: (productId: string) => void
  removeFromWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  wishlistCount: number
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [mounted, setMounted] = useState(false)

  // 마운트 시 localStorage에서 위시리스트를 불러옵니다.
  useEffect(() => {
    const saved = localStorage.getItem("vibe-check-wishlist")
    if (saved) {
      try {
        setWishlist(JSON.parse(saved))
      } catch {
        setWishlist([])
      }
    }
    setMounted(true)
  }, [])

  // 위시리스트가 변경되면 localStorage에 저장합니다.
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("vibe-check-wishlist", JSON.stringify(wishlist))
    }
  }, [wishlist, mounted])

  const addToWishlist = (productId: string) => {
    if (!isInWishlist(productId)) {
      const newItem: WishlistItem = {
        id: crypto.randomUUID(),
        product_id: productId,
        created_at: new Date().toISOString()
      }
      setWishlist(prev => [...prev, newItem])
    }
  }

  const removeFromWishlist = (productId: string) => {
    setWishlist(prev => prev.filter(item => item.product_id !== productId))
  }

  const isInWishlist = (productId: string) => {
    return wishlist.some(item => item.product_id === productId)
  }

  return (
    <WishlistContext.Provider value={{ 
      wishlist, 
      addToWishlist, 
      removeFromWishlist, 
      isInWishlist,
      wishlistCount: wishlist.length 
    }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}
