"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { createSupabaseClient } from "@/lib/supabase/client"
import {
  addCartItem,
  getCartItemsByUserId,
  removeCartItem,
  updateCartItemQuantity,
} from "@/features/cart/services"

export type CartEntry = {
  key: string
  productId: string
  quantity: number
  size: string
  dbId?: string
}

type AddToCartInput = {
  quantity?: number
  size?: string
}

interface CartContextType {
  entries: CartEntry[]
  storageMode: "local" | "supabase"
  addToCart: (productId: string, input?: AddToCartInput) => Promise<void>
  setQuantity: (entryKey: string, quantity: number) => Promise<void>
  removeFromCart: (entryKey: string) => Promise<void>
  cartCount: number
}

const LOCAL_CART_KEY = "vibe-check-cart"
const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createSupabaseClient(), [])
  const [entries, setEntries] = useState<CartEntry[]>([])
  const [storageMode, setStorageMode] = useState<"local" | "supabase">("local")
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const loadLocalCart = useCallback(() => {
    const saved = localStorage.getItem(LOCAL_CART_KEY)
    if (!saved) {
      setEntries([])
      return
    }

    try {
      const parsed = JSON.parse(saved) as CartEntry[]
      setEntries(Array.isArray(parsed) ? parsed : [])
    } catch {
      setEntries([])
    }
  }, [])

  const loadSupabaseCart = useCallback(
    async (userId: string) => {
      try {
        const rows = await getCartItemsByUserId(supabase, userId)
        setEntries(rows)
      } catch {
        setEntries([])
      }
    },
    [supabase],
  )

  const syncLocalToSupabase = useCallback(
    async (userId: string) => {
      const saved = localStorage.getItem(LOCAL_CART_KEY)
      if (!saved) return

      let localEntries: CartEntry[] = []
      try {
        localEntries = JSON.parse(saved) as CartEntry[]
      } catch {
        localEntries = []
      }

      if (localEntries.length === 0) {
        localStorage.removeItem(LOCAL_CART_KEY)
        return
      }

      for (const entry of localEntries) {
        await addCartItem(
          supabase,
          userId,
          entry.productId,
          Math.max(1, entry.quantity),
          entry.size,
        )
      }

      localStorage.removeItem(LOCAL_CART_KEY)
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
        loadLocalCart()
        return
      }

      setStorageMode("supabase")
      setCurrentUserId(user.id)
      await syncLocalToSupabase(user.id)
      await loadSupabaseCart(user.id)
    }

    initialize()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user ?? null
      if (!user) {
        setStorageMode("local")
        setCurrentUserId(null)
        loadLocalCart()
        return
      }

      setStorageMode("supabase")
      setCurrentUserId(user.id)
      await syncLocalToSupabase(user.id)
      await loadSupabaseCart(user.id)
    })

    return () => {
      isActive = false
      subscription.unsubscribe()
    }
  }, [loadLocalCart, loadSupabaseCart, supabase, syncLocalToSupabase])

  useEffect(() => {
    if (storageMode === "local") {
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(entries))
    }
  }, [entries, storageMode])

  const addToCart = useCallback(
    async (productId: string, input?: AddToCartInput) => {
      const quantity = Math.max(1, Number(input?.quantity ?? 1))
      const size = input?.size ?? "ONE SIZE"

      if (storageMode === "supabase" && currentUserId) {
        await addCartItem(supabase, currentUserId, productId, quantity, size)
        await loadSupabaseCart(currentUserId)
        return
      }

      setEntries((prev) => {
        const existing = prev.find((entry) => entry.productId === productId && entry.size === size)
        if (existing) {
          return prev.map((entry) =>
            entry.key === existing.key
              ? { ...entry, quantity: Math.max(1, entry.quantity + quantity) }
              : entry,
          )
        }
        return [
          ...prev,
          {
            key: crypto.randomUUID(),
            productId,
            quantity,
            size,
          },
        ]
      })
    },
    [currentUserId, loadSupabaseCart, storageMode, supabase],
  )

  const setQuantity = useCallback(
    async (entryKey: string, quantity: number) => {
      const nextQuantity = Math.max(1, quantity)
      const target = entries.find((entry) => entry.key === entryKey)
      if (!target) return

      setEntries((prev) =>
        prev.map((entry) => (entry.key === entryKey ? { ...entry, quantity: nextQuantity } : entry)),
      )

      if (storageMode === "supabase" && currentUserId && target.dbId) {
        await updateCartItemQuantity(supabase, target.dbId, currentUserId, nextQuantity)
      }
    },
    [currentUserId, entries, storageMode, supabase],
  )

  const removeFromCart = useCallback(
    async (entryKey: string) => {
      const target = entries.find((entry) => entry.key === entryKey)
      setEntries((prev) => prev.filter((entry) => entry.key !== entryKey))

      if (storageMode === "supabase" && currentUserId && target?.dbId) {
        await removeCartItem(supabase, target.dbId, currentUserId)
      }
    },
    [currentUserId, entries, storageMode, supabase],
  )

  const cartCount = useMemo(
    () => entries.reduce((sum, entry) => sum + Math.max(1, entry.quantity), 0),
    [entries],
  )

  return (
    <CartContext.Provider
      value={{
        entries,
        storageMode,
        addToCart,
        setQuantity,
        removeFromCart,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
