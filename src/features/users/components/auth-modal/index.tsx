"use client"

import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"
import { loginAction } from "@/features/users/actions/login"
import { signupAction } from "@/features/users/actions/signup"
import { useI18n } from "@/lib/i18n/use-i18n"
import { GoogleOAuthButton } from "./google-oauth-button"
import { ModeTabs } from "./mode-tabs"
import { signInWithGoogleOAuth } from "./oauth"
import { PasswordInput } from "./password-input"
import type { AuthMode, AuthModalProps } from "./types"

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const router = useRouter()
  const { t } = useI18n("users.auth")
  const [mode, setMode] = useState<AuthMode>("LOGIN")
  const [isGooglePending, setIsGooglePending] = useState(false)
  const [oauthErrorKey, setOauthErrorKey] = useState<string | null>(null)

  const [loginState, loginFormAction, isLoginPending] = useActionState(loginAction, null)
  const [signupState, signupFormAction, isSignupPending] = useActionState(signupAction, null)

  const isPending = mode === "LOGIN" ? isLoginPending : isSignupPending
  const actionState = mode === "LOGIN" ? loginState : signupState
  const formAction = mode === "LOGIN" ? loginFormAction : signupFormAction
  const actionErrorKey = actionState && !actionState.success ? actionState.errorKey : null
  const fallbackActionErrorMessage = actionState && !actionState.success ? actionState.message : null

  const visibleErrorMessage = oauthErrorKey
    ? t(`errors.${oauthErrorKey}`)
    : actionErrorKey
      ? t(`errors.${actionErrorKey}`)
      : fallbackActionErrorMessage

  const handleGoogleAuth = async () => {
    try {
      setOauthErrorKey(null)
      setIsGooglePending(true)
      const errorKey = await signInWithGoogleOAuth()

      if (errorKey) {
        setOauthErrorKey(errorKey)
      }
    } catch {
      setOauthErrorKey("oauth_failed")
    } finally {
      setIsGooglePending(false)
    }
  }

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

  useEffect(() => {
    if (!isOpen) {
      setOauthErrorKey(null)
      return
    }
    setOauthErrorKey(null)
  }, [isOpen, mode])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="absolute -top-3 -left-3 w-6 h-6 border-t-4 border-l-4 border-[#CCFF00]" />
        <div className="absolute -top-3 -right-3 w-6 h-6 border-t-4 border-r-4 border-[#CCFF00]" />
        <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-4 border-l-4 border-[#CCFF00]" />
        <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-4 border-r-4 border-[#CCFF00]" />

        <div className="border-4 border-[#CCFF00] bg-[#0a0a0a] p-6 md:p-8 max-h-[90vh] overflow-y-auto scrollbar-neon">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 border-2 border-[#CCFF00] bg-[#0a0a0a] text-[#CCFF00] hover:bg-[#CCFF00] hover:text-[#0a0a0a] transition-colors"
            aria-label={t("closeModal")}
          >
            <X className="w-5 h-5" />
          </button>

          <ModeTabs
            mode={mode}
            onChangeMode={setMode}
            loginLabel={t("tabLogin")}
            signupLabel={t("tabSignup")}
          />

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

          <form className="space-y-5" action={formAction} noValidate>
            {visibleErrorMessage && (
              <div className="border border-[#ff4444] px-3 py-2 text-sm text-[#ff4444]" role="alert">
                {visibleErrorMessage}
              </div>
            )}

            {actionState && actionState.success && actionState.message && (
              <div className="border border-[#CCFF00] px-3 py-2 text-sm text-[#CCFF00]" role="alert">
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

            <PasswordInput
              name="password"
              label={t("password")}
              placeholder={t("passwordPlaceholder")}
              disabled={isPending}
              showPasswordLabel={t("showPassword")}
              hidePasswordLabel={t("hidePassword")}
            />

            {mode === "SIGNUP" && (
              <PasswordInput
                name="passwordConfirm"
                label={t("confirmPassword")}
                placeholder={t("passwordPlaceholder")}
                disabled={isPending}
                showPasswordLabel={t("showPassword")}
                hidePasswordLabel={t("hidePassword")}
              />
            )}

            {mode === "LOGIN" && (
              <div className="text-right">
                <button type="button" className="text-[#888888] text-xs uppercase tracking-wider hover:text-[#CCFF00] transition-colors">
                  {t("forgotPassword")}
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 bg-[#CCFF00] text-[#0a0a0a] text-lg font-bold uppercase tracking-wider border-4 border-[#CCFF00] hover:bg-[#0a0a0a] hover:text-[#CCFF00] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? "Processing..." : mode === "LOGIN" ? t("login") : t("signup")}
            </button>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-0.5 bg-[#1a1a1a]" />
              <span className="text-[#888888] text-xs uppercase">OR</span>
              <div className="flex-1 h-0.5 bg-[#1a1a1a]" />
            </div>

            <GoogleOAuthButton label={t("google")} pending={isGooglePending} onClick={handleGoogleAuth} />
          </form>

          <p className="text-center mt-6 text-[#888888] text-xs uppercase tracking-wider">
            {mode === "LOGIN" ? t("noAccount") : t("hasAccount")}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "LOGIN" ? "SIGNUP" : "LOGIN")}
              className="text-[#CCFF00] font-bold hover:text-white transition-colors"
            >
              {mode === "LOGIN" ? t("createOne") : t("loginNow")}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
