"use client"

import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { X, Eye, EyeOff } from "lucide-react"
import { useI18n } from "@/lib/i18n/use-i18n"
import { loginAction } from "@/features/users/actions/login"
import { signupAction } from "@/features/users/actions/signup"

type AuthMode = "LOGIN" | "SIGNUP"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  language?: "EN" | "KR"
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>("LOGIN")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isGoogleHovered, setIsGoogleHovered] = useState(false)
  const { t } = useI18n("users.auth")

  const [loginState, loginFormAction, isLoginPending] = useActionState(loginAction, null)
  const [signupState, signupFormAction, isSignupPending] = useActionState(signupAction, null)

  const isPending = mode === "LOGIN" ? isLoginPending : isSignupPending
  const actionState = mode === "LOGIN" ? loginState : signupState
  const formAction = mode === "LOGIN" ? loginFormAction : signupFormAction

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const success = mode === "LOGIN" ? loginState?.success : signupState?.success
    if (success) {
      onClose()
      router.refresh()
    }
  }, [isOpen, mode, loginState, signupState, onClose, router])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="absolute -top-3 -left-3 w-6 h-6 border-t-4 border-l-4 border-[#CCFF00]" />
        <div className="absolute -top-3 -right-3 w-6 h-6 border-t-4 border-r-4 border-[#CCFF00]" />
        <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-4 border-l-4 border-[#CCFF00]" />
        <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-4 border-r-4 border-[#CCFF00]" />

        <div className="border-4 border-[#CCFF00] bg-[#0a0a0a] p-6 md:p-8 max-h-[90vh] overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 border-2 border-[#CCFF00] bg-[#0a0a0a] text-[#CCFF00] hover:bg-[#CCFF00] hover:text-[#0a0a0a] transition-colors"
            aria-label={t("closeModal")}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex mb-6 border-2 border-[#CCFF00]">
            <button
              onClick={() => setMode("LOGIN")}
              className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${
                mode === "LOGIN"
                  ? "bg-[#CCFF00] text-[#0a0a0a]"
                  : "bg-[#0a0a0a] text-[#CCFF00] hover:bg-[#1a1a1a]"
              }`}
            >
              {t("tabLogin")}
            </button>
            <button
              onClick={() => setMode("SIGNUP")}
              className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors border-l-2 border-[#CCFF00] ${
                mode === "SIGNUP"
                  ? "bg-[#CCFF00] text-[#0a0a0a]"
                  : "bg-[#0a0a0a] text-[#CCFF00] hover:bg-[#1a1a1a]"
              }`}
            >
              {t("tabSignup")}
            </button>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tighter leading-none">
              {mode === "LOGIN" ? t("loginTitle") : t("signupTitle")}
              <br />
              <span className="text-[#CCFF00]">{mode === "LOGIN" ? t("loginTitleAccent") : t("signupTitleAccent")}</span>
            </h2>
            <p className="text-[#888888] text-xs uppercase tracking-[0.2em] mt-3">
              {mode === "LOGIN" ? t("loginSubtitle") : t("signupSubtitle")}
            </p>
          </div>

          <form className="space-y-5" action={formAction}>
            {actionState && actionState.message && (
              <div
                className={`border px-3 py-2 text-sm ${
                  actionState.success
                    ? "border-[#CCFF00] text-[#CCFF00]"
                    : "border-[#ff4444] text-[#ff4444]"
                }`}
                role="alert"
              >
                {actionState.message}
              </div>
            )}

            {mode === "SIGNUP" && (
              <div>
                <label className="block text-[#CCFF00] text-xs font-bold uppercase tracking-wider mb-2">{t("username")}</label>
                <input
                  name="name"
                  type="text"
                  placeholder={t("usernamePlaceholder")}
                  className="w-full bg-transparent text-white text-base py-2.5 border-b-4 border-[#CCFF00] focus:outline-none focus:border-white placeholder:text-[#444444] transition-colors"
                  required
                  disabled={isPending}
                />
              </div>
            )}

            <div>
              <label className="block text-[#CCFF00] text-xs font-bold uppercase tracking-wider mb-2">{t("email")}</label>
              <input
                name="email"
                type="email"
                placeholder={t("emailPlaceholder")}
                className="w-full bg-transparent text-white text-base py-2.5 border-b-4 border-[#CCFF00] focus:outline-none focus:border-white placeholder:text-[#444444] transition-colors"
                required
                disabled={isPending}
              />
            </div>

            <div>
              <label className="block text-[#CCFF00] text-xs font-bold uppercase tracking-wider mb-2">{t("password")}</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("passwordPlaceholder")}
                  className="w-full bg-transparent text-white text-base py-2.5 border-b-4 border-[#CCFF00] focus:outline-none focus:border-white placeholder:text-[#444444] transition-colors pr-10"
                  required
                  disabled={isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[#CCFF00] hover:text-white transition-colors"
                  aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {mode === "SIGNUP" && (
              <div>
                <label className="block text-[#CCFF00] text-xs font-bold uppercase tracking-wider mb-2">{t("confirmPassword")}</label>
                <div className="relative">
                  <input
                    name="passwordConfirm"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={t("passwordPlaceholder")}
                    className="w-full bg-transparent text-white text-base py-2.5 border-b-4 border-[#CCFF00] focus:outline-none focus:border-white placeholder:text-[#444444] transition-colors pr-10"
                    required
                    disabled={isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-[#CCFF00] hover:text-white transition-colors"
                    aria-label={showConfirmPassword ? t("hidePassword") : t("showPassword")}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {mode === "LOGIN" && (
              <div className="text-right">
                <button type="button" className="text-[#888888] text-xs uppercase tracking-wider hover:text-[#CCFF00] transition-colors">{t("forgotPassword")}</button>
              </div>
            )}

            <button type="submit" disabled={isPending} className="w-full py-3.5 bg-[#CCFF00] text-[#0a0a0a] text-lg font-bold uppercase tracking-wider border-4 border-[#CCFF00] hover:bg-[#0a0a0a] hover:text-[#CCFF00] transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
              {isPending ? "Processing..." : mode === "LOGIN" ? t("login") : t("signup")}
            </button>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-0.5 bg-[#1a1a1a]" />
              <span className="text-[#888888] text-xs uppercase">OR</span>
              <div className="flex-1 h-0.5 bg-[#1a1a1a]" />
            </div>

            <button
              type="button"
              onMouseEnter={() => setIsGoogleHovered(true)}
              onMouseLeave={() => setIsGoogleHovered(false)}
              className="relative w-full py-3.5 bg-[#0a0a0a] text-[#CCFF00] text-base font-bold uppercase tracking-wider border-4 border-[#CCFF00] hover:bg-[#1a1a1a] transition-colors overflow-hidden"
            >
              <span className="inline-block">{t("google")}</span>
              {isGoogleHovered && (
                <>
                  <span className="absolute inset-0 flex items-center justify-center text-[#ff0000] opacity-70 font-bold uppercase tracking-wider" style={{ clipPath: "polygon(0 0, 100% 0, 100% 45%, 0 45%)", transform: "translate(-2px, 0)" }}>{t("google")}</span>
                  <span className="absolute inset-0 flex items-center justify-center text-[#00ffff] opacity-70 font-bold uppercase tracking-wider" style={{ clipPath: "polygon(0 55%, 100% 55%, 100% 100%, 0 100%)", transform: "translate(2px, 0)" }}>{t("google")}</span>
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-[#888888] text-xs uppercase tracking-wider">
            {mode === "LOGIN" ? t("noAccount") : t("hasAccount")}{" "}
            <button type="button" onClick={() => setMode(mode === "LOGIN" ? "SIGNUP" : "LOGIN")} className="text-[#CCFF00] font-bold hover:text-white transition-colors">
              {mode === "LOGIN" ? t("createOne") : t("loginNow")}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}