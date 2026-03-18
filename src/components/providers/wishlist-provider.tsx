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
        console.log("[wishlist] loadSupabaseWishlist:start", { userId })
        const items = await getWishlistByUserId(supabase, userId)
        setWishlist(items)
        console.log("[wishlist] loadSupabaseWishlist:success", { userId, count: items.length })
      } catch {
        console.error("[wishlist] loadSupabaseWishlist:failed", { userId })
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
        console.log("[wishlist] initialize -> local mode (no user)")
        setStorageMode("local")
        setCurrentUserId(null)
        loadLocalWishlist()
        return
      }

      try {
        await ensureUserProfile(supabase, user)
        console.log("[wishlist] ensureUserProfile:success", { userId: user.id })
      } catch {
        console.error("[wishlist] ensureUserProfile:failed -> fallback local", { userId: user.id })
        setStorageMode("local")
        setCurrentUserId(null)
        loadLocalWishlist()
        return
      }

      console.log("[wishlist] initialize -> supabase mode", { userId: user.id })
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
        console.log("[wishlist] auth change -> local mode (signed out)")
        setStorageMode("local")
        setCurrentUserId(null)
        loadLocalWishlist()
        return
      }

      try {
        await ensureUserProfile(supabase, user)
        console.log("[wishlist] auth change ensureUserProfile:success", { userId: user.id })
      } catch {
        console.error("[wishlist] auth change ensureUserProfile:failed -> fallback local", { userId: user.id })
        setStorageMode("local")
        setCurrentUserId(null)
        loadLocalWishlist()
        return
      }

      console.log("[wishlist] auth change -> supabase mode", { userId: user.id })
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

  const addLocalWishlistItem = useCallback((productId: string) => {
    const newItem: WishlistItem = {
      id: crypto.randomUUID(),
      product_id: productId,
      created_at: new Date().toISOString(),
    }
    setWishlist((prev) => [...prev, newItem])
  }, [])

  const addToWishlist = async (productId: string) => {
    console.log("[wishlist] addToWishlist:click", { productId, storageMode, hasUser: Boolean(currentUserId) })
    if (!isInWishlist(productId)) {
      if (storageMode === "supabase" && currentUserId) {
        try {
          const inserted = await addWishlistItem(supabase, currentUserId, productId)
          setWishlist((prev) => [
            inserted,
            ...prev,
          ])
          console.log("[wishlist] addToWishlist:supabase success", { productId, userId: currentUserId })
        } catch (error) {
          console.error("[wishlist] addToWishlist:supabase failed", {
            productId,
            userId: currentUserId,
            message: error instanceof Error ? error.message : String(error),
          })
          setStorageMode("local")
          setCurrentUserId(null)
          addLocalWishlistItem(productId)
          console.log("[wishlist] addToWishlist:fallback local success", { productId })
        }
        return
      }

      addLocalWishlistItem(productId)
      console.log("[wishlist] addToWishlist:local success", { productId })
    }
  }

  const removeFromWishlist = async (productId: string) => {
    console.log("[wishlist] removeFromWishlist:click", { productId, storageMode, hasUser: Boolean(currentUserId) })
    if (storageMode === "supabase" && currentUserId) {
      const item = wishlist.find((w) => w.product_id === productId)
      try {
        await removeWishlistItem(supabase, currentUserId, productId, item?.id)
        console.log("[wishlist] removeFromWishlist:supabase success", { productId, userId: currentUserId })
      } catch {
        console.error("[wishlist] removeFromWishlist:supabase failed", { productId, userId: currentUserId })
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
