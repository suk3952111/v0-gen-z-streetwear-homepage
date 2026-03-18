"use client"

import { useEffect, useMemo, useState } from "react"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { AuthModal } from "@/features/users/components/auth-modal"
import { createSupabaseClient } from "@/lib/supabase/client"

type ShellUser = {
  id: string
  fullName: string | null
  role: string | null
} | null

export function AppShellClient({
  children,
  currentUser,
}: {
  children: React.ReactNode
  currentUser: ShellUser
}) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const supabase = useMemo(() => createSupabaseClient(), [])

  useEffect(() => {
    if (currentUser) {
      setIsAuthModalOpen(false)
    }
  }, [currentUser])

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        setIsAuthModalOpen(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return (
    <>
      <Header currentUser={currentUser} onAuthClick={() => setIsAuthModalOpen(true)} />
      {children}
      <Footer />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  )
}
