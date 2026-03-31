"use client"

import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from "react"
import { useAuthSyncedStorage } from "@/components/providers/use-auth-synced-storage"
import { createSupabaseClient } from "@/lib/supabase/client"
import {
  addWishlistItem,
  getWishlistByUserId,
  removeWishlistItem,
  syncLocalWishlistToUser,
} from "@/features/wishlist/services"
import { withTimeout } from "@/lib/utils/with-timeout"

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
  isHydrating: boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)
const LOCAL_WISHLIST_KEY = "vibe-check-wishlist"

const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === "string" && value.trim().length > 0
}

const getWishlistProductId = (item: unknown) => {
  if (isNonEmptyString(item)) return item.trim()
  if (!item || typeof item !== "object") return null

  const record = item as Record<string, unknown>
  if (isNonEmptyString(record.product_id)) return record.product_id.trim()
  if (isNonEmptyString(record.productId)) return record.productId.trim()
  if (isNonEmptyString(record.slug)) return record.slug.trim()
  return null
}

const normalizeWishlistStorage = (raw: unknown): WishlistItem[] => {
  if (!Array.isArray(raw)) return []

  const now = new Date().toISOString()
  const seen = new Set<string>()
  const normalized: WishlistItem[] = []

  raw.forEach((item, index) => {
    const productId = getWishlistProductId(item)
    if (!productId || seen.has(productId)) return

    const record = item && typeof item === "object" ? (item as Record<string, unknown>) : null
    const id = record && isNonEmptyString(record.id) ? record.id : `local-${productId}-${index}`
    const created_at =
      record && isNonEmptyString(record.created_at) ? record.created_at : now

    seen.add(productId)
    normalized.push({
      id,
      product_id: productId,
      created_at,
    })
  })

  return normalized
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const supabase = useMemo(() => createSupabaseClient(), [])

  const loadLocalWishlist = useCallback(() => {
    const saved = localStorage.getItem(LOCAL_WISHLIST_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as unknown
        const normalized = normalizeWishlistStorage(parsed)
        setWishlist(normalized)
        localStorage.setItem(LOCAL_WISHLIST_KEY, JSON.stringify(normalized))
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
        const items = await withTimeout(getWishlistByUserId(supabase, userId), 5000)
        setWishlist(items)
        console.log("[wishlist] loadSupabaseWishlist:success", { userId, count: items.length })
      } catch (error) {
        console.error("[wishlist] loadSupabaseWishlist:failed", {
          userId,
          message: error instanceof Error ? error.message : String(error),
        })
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
        const parsed = JSON.parse(saved) as unknown
        localItems = normalizeWishlistStorage(parsed)
      } catch {
        localItems = []
      }

      if (localItems.length === 0) {
        localStorage.removeItem(LOCAL_WISHLIST_KEY)
        return
      }

      await withTimeout(syncLocalWishlistToUser(supabase, userId, localItems), 5000)

      localStorage.removeItem(LOCAL_WISHLIST_KEY)
    },
    [supabase],
  )

  const { activateLocalMode, currentUserId, isHydrating, storageMode } = useAuthSyncedStorage({
    supabase,
    scope: "wishlist",
    loadLocal: loadLocalWishlist,
    loadSupabase: loadSupabaseWishlist,
    syncLocalToSupabase,
  })

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
          const inserted = await withTimeout(addWishlistItem(supabase, currentUserId, productId), 5000)
          setWishlist((prev) => [
            inserted,
            ...prev,
          ])
          console.log("[wishlist] addToWishlist:supabase success", { productId, userId: currentUserId })
        } catch (error) {
          console.error("[wishlist] addToWishlist:supabase failed -> fallback local", {
            productId,
            userId: currentUserId,
            message: error instanceof Error ? error.message : String(error),
          })
          activateLocalMode()
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
        await withTimeout(removeWishlistItem(supabase, currentUserId, productId, item?.id), 5000)
        console.log("[wishlist] removeFromWishlist:supabase success", { productId, userId: currentUserId })
      } catch (error) {
        console.error("[wishlist] removeFromWishlist:supabase failed", {
          productId,
          userId: currentUserId,
          message: error instanceof Error ? error.message : String(error),
        })
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
        isHydrating,
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
