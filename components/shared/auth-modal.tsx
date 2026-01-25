"use client"

import { useState } from "react"
import { X, Eye, EyeOff } from "lucide-react"

type Language = "EN" | "KR"
type AuthMode = "LOGIN" | "SIGNUP"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  language: Language
}

const content = {
  EN: {
    loginTitle: "IDENTITY",
    loginTitleAccent: "CHECK",
    signupTitle: "ESTABLISH",
    signupTitleAccent: "PROTOCOL",
    loginSubtitle: "SYNC YOUR VIBE WITH US",
    signupSubtitle: "JOIN THE VIBE COLLECTIVE",
    email: "EMAIL",
    password: "PASSWORD",
    confirmPassword: "CONFIRM PASSWORD",
    username: "USERNAME",
    emailPlaceholder: "YOUR@EMAIL.COM",
    passwordPlaceholder: "••••••••",
    usernamePlaceholder: "YOUR_HANDLE",
    login: "AUTHENTICATE",
    signup: "INITIALIZE",
    google: "SYNC WITH GOOGLE",
    noAccount: "NO ACCOUNT?",
    createOne: "CREATE ONE",
    hasAccount: "ALREADY SYNCED?",
    loginNow: "LOGIN",
    forgotPassword: "FORGOT PASSWORD?",
    tabLogin: "LOGIN",
    tabSignup: "SIGNUP",
  },
  KR: {
    loginTitle: "신원",
    loginTitleAccent: "확인",
    signupTitle: "프로토콜",
    signupTitleAccent: "설정",
    loginSubtitle: "우리와 바이브를 동기화하세요",
    signupSubtitle: "바이브 컬렉티브에 합류하세요",
    email: "이메일",
    password: "비밀번호",
    confirmPassword: "비밀번호 확인",
    username: "유저네임",
    emailPlaceholder: "YOUR@EMAIL.COM",
    passwordPlaceholder: "••••••••",
    usernamePlaceholder: "YOUR_HANDLE",
    login: "인증하기",
    signup: "등록하기",
    google: "구글로 동기화",
    noAccount: "계정이 없으신가요?",
    createOne: "만들기",
    hasAccount: "이미 계정이 있으신가요?",
    loginNow: "로그인",
    forgotPassword: "비밀번호 찾기",
    tabLogin: "로그인",
    tabSignup: "가입하기",
  },
}

export function AuthModal({ isOpen, onClose, language }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("LOGIN")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isGoogleHovered, setIsGoogleHovered] = useState(false)

  const t = content[language]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Grainy texture overlay */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Corner Accents */}
        <div className="absolute -top-3 -left-3 w-6 h-6 border-t-4 border-l-4 border-[#CCFF00]" />
        <div className="absolute -top-3 -right-3 w-6 h-6 border-t-4 border-r-4 border-[#CCFF00]" />
        <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-4 border-l-4 border-[#CCFF00]" />
        <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-4 border-r-4 border-[#CCFF00]" />

        <div className="border-4 border-[#CCFF00] bg-[#0a0a0a] p-6 md:p-8 max-h-[90vh] overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 border-2 border-[#CCFF00] bg-[#0a0a0a] text-[#CCFF00] hover:bg-[#CCFF00] hover:text-[#0a0a0a] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Mode Toggle Tabs */}
          <div className="flex mb-6 border-2 border-[#CCFF00]">
            <button
              onClick={() => setMode("LOGIN")}
              className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${
                mode === "LOGIN"
                  ? "bg-[#CCFF00] text-[#0a0a0a]"
                  : "bg-[#0a0a0a] text-[#CCFF00] hover:bg-[#1a1a1a]"
              }`}
            >
              {t.tabLogin}
            </button>
            <button
              onClick={() => setMode("SIGNUP")}
              className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors border-l-2 border-[#CCFF00] ${
                mode === "SIGNUP"
                  ? "bg-[#CCFF00] text-[#0a0a0a]"
                  : "bg-[#0a0a0a] text-[#CCFF00] hover:bg-[#1a1a1a]"
              }`}
            >
              {t.tabSignup}
            </button>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tighter leading-none">
              {mode === "LOGIN" ? t.loginTitle : t.signupTitle}
              <br />
              <span className="text-[#CCFF00]">
                {mode === "LOGIN" ? t.loginTitleAccent : t.signupTitleAccent}
              </span>
            </h2>
            <p className="text-[#888888] text-xs uppercase tracking-[0.2em] mt-3">
              {mode === "LOGIN" ? t.loginSubtitle : t.signupSubtitle}
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            {/* Username Field - Only for Signup */}
            {mode === "SIGNUP" && (
              <div>
                <label className="block text-[#CCFF00] text-xs font-bold uppercase tracking-wider mb-2">
                  {t.username}
                </label>
                <input
                  type="text"
                  placeholder={t.usernamePlaceholder}
                  className="w-full bg-transparent text-white text-base py-2.5 border-b-4 border-[#CCFF00] focus:outline-none focus:border-white placeholder:text-[#444444] transition-colors"
                />
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-[#CCFF00] text-xs font-bold uppercase tracking-wider mb-2">
                {t.email}
              </label>
              <input
                type="email"
                placeholder={t.emailPlaceholder}
                className="w-full bg-transparent text-white text-base py-2.5 border-b-4 border-[#CCFF00] focus:outline-none focus:border-white placeholder:text-[#444444] transition-colors"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[#CCFF00] text-xs font-bold uppercase tracking-wider mb-2">
                {t.password}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={t.passwordPlaceholder}
                  className="w-full bg-transparent text-white text-base py-2.5 border-b-4 border-[#CCFF00] focus:outline-none focus:border-white placeholder:text-[#444444] transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[#CCFF00] hover:text-white transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field - Only for Signup */}
            {mode === "SIGNUP" && (
              <div>
                <label className="block text-[#CCFF00] text-xs font-bold uppercase tracking-wider mb-2">
                  {t.confirmPassword}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={t.passwordPlaceholder}
                    className="w-full bg-transparent text-white text-base py-2.5 border-b-4 border-[#CCFF00] focus:outline-none focus:border-white placeholder:text-[#444444] transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-[#CCFF00] hover:text-white transition-colors"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Forgot Password - Only for Login */}
            {mode === "LOGIN" && (
              <div className="text-right">
                <button
                  type="button"
                  className="text-[#888888] text-xs uppercase tracking-wider hover:text-[#CCFF00] transition-colors"
                >
                  {t.forgotPassword}
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 bg-[#CCFF00] text-[#0a0a0a] text-lg font-bold uppercase tracking-wider border-4 border-[#CCFF00] hover:bg-[#0a0a0a] hover:text-[#CCFF00] transition-colors"
            >
              {mode === "LOGIN" ? t.login : t.signup}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-0.5 bg-[#1a1a1a]" />
              <span className="text-[#888888] text-xs uppercase">OR</span>
              <div className="flex-1 h-0.5 bg-[#1a1a1a]" />
            </div>

            {/* Google Button with Glitch Effect */}
            <button
              type="button"
              onMouseEnter={() => setIsGoogleHovered(true)}
              onMouseLeave={() => setIsGoogleHovered(false)}
              className="relative w-full py-3.5 bg-[#0a0a0a] text-[#CCFF00] text-base font-bold uppercase tracking-wider border-4 border-[#CCFF00] hover:bg-[#1a1a1a] transition-colors overflow-hidden"
            >
              <span className="inline-block">
                {t.google}
              </span>
              {/* Glitch layers */}
              {isGoogleHovered && (
                <>
                  <span
                    className="absolute inset-0 flex items-center justify-center text-[#ff0000] opacity-70 font-bold uppercase tracking-wider"
                    style={{
                      clipPath: "polygon(0 0, 100% 0, 100% 45%, 0 45%)",
                      transform: "translate(-2px, 0)",
                    }}
                  >
                    {t.google}
                  </span>
                  <span
                    className="absolute inset-0 flex items-center justify-center text-[#00ffff] opacity-70 font-bold uppercase tracking-wider"
                    style={{
                      clipPath: "polygon(0 55%, 100% 55%, 100% 100%, 0 100%)",
                      transform: "translate(2px, 0)",
                    }}
                  >
                    {t.google}
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Switch Mode */}
          <p className="text-center mt-6 text-[#888888] text-xs uppercase tracking-wider">
            {mode === "LOGIN" ? t.noAccount : t.hasAccount}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "LOGIN" ? "SIGNUP" : "LOGIN")}
              className="text-[#CCFF00] font-bold hover:text-white transition-colors"
            >
              {mode === "LOGIN" ? t.createOne : t.loginNow}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
