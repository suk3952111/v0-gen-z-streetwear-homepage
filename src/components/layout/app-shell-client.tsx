"use client"

import { useState } from "react"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { AuthModal } from "@/features/users/components/auth-modal"

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

  return (
    <>
      <Header currentUser={currentUser} onAuthClick={() => setIsAuthModalOpen(true)} />
      {children}
      <Footer />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  )
}
