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
import { ensureUserProfile } from "@/features/users/services"

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
  isHydrating: boolean
}

const LOCAL_CART_KEY = "vibe-check-cart"
const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createSupabaseClient(), [])
  const [entries, setEntries] = useState<CartEntry[]>([])
  const [storageMode, setStorageMode] = useState<"local" | "supabase">("local")
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isHydrating, setIsHydrating] = useState(true)

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
        console.log("[cart] loadSupabaseCart:start", { userId })
        const rows = await getCartItemsByUserId(supabase, userId)
        setEntries(rows)
        console.log("[cart] loadSupabaseCart:success", { userId, count: rows.length })
      } catch {
        console.error("[cart] loadSupabaseCart:failed", { userId })
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
      setIsHydrating(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!isActive) return

      if (!user) {
        console.log("[cart] initialize -> local mode (no user)")
        setStorageMode("local")
        setCurrentUserId(null)
        loadLocalCart()
        setIsHydrating(false)
        return
      }

      try {
        await ensureUserProfile(supabase, user)
        console.log("[cart] ensureUserProfile:success", { userId: user.id })
      } catch {
        console.error("[cart] ensureUserProfile:failed -> fallback local", { userId: user.id })
        setStorageMode("local")
        setCurrentUserId(null)
        loadLocalCart()
        setIsHydrating(false)
        return
      }

      console.log("[cart] initialize -> supabase mode", { userId: user.id })
      setStorageMode("supabase")
      setCurrentUserId(user.id)
      try {
        await syncLocalToSupabase(user.id)
        await loadSupabaseCart(user.id)
      } catch {
        setStorageMode("local")
        setCurrentUserId(null)
        loadLocalCart()
      } finally {
        if (isActive) setIsHydrating(false)
      }
    }

    initialize()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsHydrating(true)
      const user = session?.user ?? null
      if (!user) {
        console.log("[cart] auth change -> local mode (signed out)")
        setStorageMode("local")
        setCurrentUserId(null)
        loadLocalCart()
        setIsHydrating(false)
        return
      }

      try {
        await ensureUserProfile(supabase, user)
        console.log("[cart] auth change ensureUserProfile:success", { userId: user.id })
      } catch {
        console.error("[cart] auth change ensureUserProfile:failed -> fallback local", { userId: user.id })
        setStorageMode("local")
        setCurrentUserId(null)
        loadLocalCart()
        setIsHydrating(false)
        return
      }

      console.log("[cart] auth change -> supabase mode", { userId: user.id })
      setStorageMode("supabase")
      setCurrentUserId(user.id)
      try {
        await syncLocalToSupabase(user.id)
        await loadSupabaseCart(user.id)
      } catch {
        setStorageMode("local")
        setCurrentUserId(null)
        loadLocalCart()
      } finally {
        setIsHydrating(false)
      }
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

  const addLocalEntry = useCallback((productId: string, quantity: number, size: string) => {
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
  }, [])

  const addToCart = useCallback(
    async (productId: string, input?: AddToCartInput) => {
      const quantity = Math.max(1, Number(input?.quantity ?? 1))
      const size = input?.size ?? "ONE SIZE"
      console.log("[cart] addToCart:click", { productId, quantity, size, storageMode, hasUser: Boolean(currentUserId) })

      if (storageMode === "supabase" && currentUserId) {
        try {
          await addCartItem(supabase, currentUserId, productId, quantity, size)
          console.log("[cart] addToCart:supabase success", { productId, userId: currentUserId })
          await loadSupabaseCart(currentUserId)
        } catch (error) {
          console.error("[cart] addToCart:supabase failed", {
            productId,
            userId: currentUserId,
            message: error instanceof Error ? error.message : String(error),
          })
          setStorageMode("local")
          setCurrentUserId(null)
          addLocalEntry(productId, quantity, size)
          console.log("[cart] addToCart:fallback local success", { productId, quantity, size })
        }
        return
      }

      addLocalEntry(productId, quantity, size)
      console.log("[cart] addToCart:local success", { productId, quantity, size })
    },
    [addLocalEntry, currentUserId, loadSupabaseCart, storageMode, supabase],
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
        isHydrating,
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
