"use client"

import { useCallback, useEffect, useState } from "react"
import type { SupabaseClient, User } from "@supabase/supabase-js"
import { ensureUserProfile } from "@/features/users/services"
import type { Database } from "@/types/database.types"
import { withTimeout } from "@/lib/utils/with-timeout"

type StorageMode = "local" | "supabase"
type HydrationPhase = "initialize" | "auth change"

type ActivateLocalModeOptions = {
  loadStoredState?: boolean
}

type UseAuthSyncedStorageOptions = {
  supabase: SupabaseClient<Database>
  scope: string
  loadLocal: () => void
  loadSupabase: (userId: string) => Promise<void>
  syncLocalToSupabase: (userId: string) => Promise<void>
}

const getLocalModeMessage = (phase: HydrationPhase) => {
  if (phase === "initialize") {
    return "initialize -> local mode (no user)"
  }

  return "auth change -> local mode (signed out)"
}

const getEnsureProfileSuccessMessage = (phase: HydrationPhase) => {
  if (phase === "initialize") {
    return "ensureUserProfile:success"
  }

  return "auth change ensureUserProfile:success"
}

const getEnsureProfileFailureMessage = (phase: HydrationPhase) => {
  if (phase === "initialize") {
    return "ensureUserProfile:failed -> fallback local"
  }

  return "auth change ensureUserProfile:failed -> fallback local"
}

const getSupabaseModeMessage = (phase: HydrationPhase) => {
  if (phase === "initialize") {
    return "initialize -> supabase mode"
  }

  return "auth change -> supabase mode"
}

const getSyncFailureMessage = (phase: HydrationPhase) => {
  if (phase === "initialize") {
    return "initialize:syncOrLoad failed -> fallback local"
  }

  return "auth change:syncOrLoad failed -> fallback local"
}

export const useAuthSyncedStorage = ({
  supabase,
  scope,
  loadLocal,
  loadSupabase,
  syncLocalToSupabase,
}: UseAuthSyncedStorageOptions) => {
  const [storageMode, setStorageMode] = useState<StorageMode>("local")
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isHydrating, setIsHydrating] = useState(true)

  const activateLocalMode = useCallback(
    (options?: ActivateLocalModeOptions) => {
      setStorageMode("local")
      setCurrentUserId(null)

      if (options?.loadStoredState) {
        loadLocal()
      }
    },
    [loadLocal],
  )

  const handleAuthenticatedUser = useCallback(
    async (user: User, phase: HydrationPhase, canContinue: () => boolean) => {
      try {
        await withTimeout(ensureUserProfile(supabase, user), 5000)
        console.log(`[${scope}] ${getEnsureProfileSuccessMessage(phase)}`, { userId: user.id })
      } catch (error) {
        console.error(`[${scope}] ${getEnsureProfileFailureMessage(phase)}`, {
          userId: user.id,
          message: error instanceof Error ? error.message : String(error),
        })
        activateLocalMode({ loadStoredState: true })
        return
      }

      console.log(`[${scope}] ${getSupabaseModeMessage(phase)}`, { userId: user.id })
      setStorageMode("supabase")
      setCurrentUserId(user.id)

      try {
        await syncLocalToSupabase(user.id)
        if (!canContinue()) return
        await loadSupabase(user.id)
      } catch (error) {
        console.error(`[${scope}] ${getSyncFailureMessage(phase)}`, {
          userId: user.id,
          message: error instanceof Error ? error.message : String(error),
        })
        activateLocalMode({ loadStoredState: true })
      }
    },
    [activateLocalMode, loadSupabase, scope, supabase, syncLocalToSupabase],
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
        console.log(`[${scope}] ${getLocalModeMessage("initialize")}`)
        activateLocalMode({ loadStoredState: true })
        setIsHydrating(false)
        return
      }

      await handleAuthenticatedUser(user, "initialize", () => isActive)

      if (isActive) {
        setIsHydrating(false)
      }
    }

    initialize()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsHydrating(true)
      const user = session?.user ?? null

      if (!user) {
        console.log(`[${scope}] ${getLocalModeMessage("auth change")}`)
        activateLocalMode({ loadStoredState: true })
        setIsHydrating(false)
        return
      }

      await handleAuthenticatedUser(user, "auth change", () => true)
      setIsHydrating(false)
    })

    return () => {
      isActive = false
      subscription.unsubscribe()
    }
  }, [activateLocalMode, handleAuthenticatedUser, scope, supabase])

  return {
    activateLocalMode,
    currentUserId,
    isHydrating,
    storageMode,
  }
}
