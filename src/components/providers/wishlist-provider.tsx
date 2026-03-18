"use client"

import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from "react"
import { createSupabaseClient } from "@/lib/supabase/client"
import {
  addWishlistItem,
  getWishlistByUserId,
  removeWishlistItem,
  syncLocalWishlistToUser,
} from "@/features/wishlist/services"
import { ensureUserProfile } from "@/features/users/services"

export interface WishlistItem {
  id: string
  product_id: string
  created_at: string
}

interface WishlistContextType {
  wishlist: WishlistItem[]
  addToWishlist: (productId: string) => Promise<void>
  removeFromWishlist: (productId: string) => Promise<void>
  isInWishlist: (productId: string) => boolean
  wishlistCount: number
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)
const LOCAL_WISHLIST_KEY = "vibe-check-wishlist"

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [storageMode, setStorageMode] = useState<"local" | "supabase">("local")
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const supabase = useMemo(() => createSupabaseClient(), [])

  const loadLocalWishlist = useCallback(() => {
    const saved = localStorage.getItem(LOCAL_WISHLIST_KEY)
    if (saved) {
      try {
        setWishlist(JSON.parse(saved))
        return
      } catch {
        // ignore parse error and fallback to empty
      }
    }
    setWishlist([])
  }, [])

  const loadSupabaseWishlist = useCallback(
    async (userId: string) => {
      try {
        const items = await getWishlistByUserId(supabase, userId)
        setWishlist(items)
      } catch {
        setWishlist([])
      }
    },
    [supabase],
  )

  const syncLocalToSupabase = useCallback(
    async (userId: string) => {
      const saved = localStorage.getItem(LOCAL_WISHLIST_KEY)
      if (!saved) return

      let localItems: WishlistItem[] = []
      try {
        localItems = JSON.parse(saved)
      } catch {
        localItems = []
      }

      if (localItems.length === 0) {
        localStorage.removeItem(LOCAL_WISHLIST_KEY)
        return
      }

      await syncLocalWishlistToUser(supabase, userId, localItems)

      localStorage.removeItem(LOCAL_WISHLIST_KEY)
    },
    [supabase],
  )

  useEffect(() => {
    let isActive = true

    const initialize = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!isActive) return

      if (!user) {
        setStorageMode("local")
        setCurrentUserId(null)
        loadLocalWishlist()
        return
      }

      try {
        await ensureUserProfile(supabase, user)
      } catch {
        setStorageMode("local")
        setCurrentUserId(null)
        loadLocalWishlist()
        return
      }

      setStorageMode("supabase")
      setCurrentUserId(user.id)
      await syncLocalToSupabase(user.id)
      if (!isActive) return
      await loadSupabaseWishlist(user.id)
    }

    initialize()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user ?? null

      if (!user) {
        setStorageMode("local")
        setCurrentUserId(null)
        loadLocalWishlist()
        return
      }

      try {
        await ensureUserProfile(supabase, user)
      } catch {
        setStorageMode("local")
        setCurrentUserId(null)
        loadLocalWishlist()
        return
      }

      setStorageMode("supabase")
      setCurrentUserId(user.id)
      await syncLocalToSupabase(user.id)
      await loadSupabaseWishlist(user.id)
    })

    return () => {
      isActive = false
      subscription.unsubscribe()
    }
  }, [loadLocalWishlist, loadSupabaseWishlist, supabase, syncLocalToSupabase])

  useEffect(() => {
    if (storageMode === "local") {
      localStorage.setItem(LOCAL_WISHLIST_KEY, JSON.stringify(wishlist))
    }
  }, [wishlist, storageMode])

  const addToWishlist = async (productId: string) => {
    if (!isInWishlist(productId)) {
      if (storageMode === "supabase" && currentUserId) {
        try {
          const inserted = await addWishlistItem(supabase, currentUserId, productId)
          setWishlist((prev) => [
            inserted,
            ...prev,
          ])
        } catch {
          // ignore add failure
        }
        return
      }

      const newItem: WishlistItem = {
        id: crypto.randomUUID(),
        product_id: productId,
        created_at: new Date().toISOString(),
      }
      setWishlist((prev) => [...prev, newItem])
    }
  }

  const removeFromWishlist = async (productId: string) => {
    if (storageMode === "supabase" && currentUserId) {
      const item = wishlist.find((w) => w.product_id === productId)
      try {
        await removeWishlistItem(supabase, currentUserId, productId, item?.id)
      } catch {
        // ignore remove failure
      }
    }

    setWishlist((prev) => prev.filter((item) => item.product_id !== productId))
  }

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.product_id === productId)
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        wishlistCount: wishlist.length,
      }}
    >
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
