"use client"

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AuthModal } from "@/components/auth-modal"
import { Eye, EyeOff } from "lucide-react"

type Language = "EN" | "KR"

const content = {
  EN: {
    title: "IDENTITY",
    titleAccent: "CHECK",
    subtitle: "SYNC YOUR VIBE WITH US",
    email: "EMAIL",
    password: "PASSWORD",
    emailPlaceholder: "YOUR@EMAIL.COM",
    passwordPlaceholder: "••••••••",
    login: "AUTHENTICATE",
    google: "SYNC WITH GOOGLE",
    noAccount: "NO ACCOUNT?",
    createOne: "CREATE ONE",
    forgotPassword: "FORGOT PASSWORD?",
  },
  KR: {
    title: "신원",
    titleAccent: "확인",
    subtitle: "우리와 바이브를 동기화하세요",
    email: "이메일",
    password: "비밀번호",
    emailPlaceholder: "YOUR@EMAIL.COM",
    passwordPlaceholder: "••••••••",
    login: "인증하기",
    google: "구글로 동기화",
    noAccount: "계정이 없으신가요?",
    createOne: "만들기",
    forgotPassword: "비밀번호 찾기",
  },
}

export default function LoginPage() {
  const [language, setLanguage] = useState<Language>("EN")
  const [showPassword, setShowPassword] = useState(false)
  const [isGoogleHovered, setIsGoogleHovered] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  const t = content[language]

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Header 
        language={language} 
        onLanguageChange={setLanguage} 
        onAuthClick={() => setIsAuthModalOpen(true)}
      />

      <section className="relative min-h-screen flex items-center justify-center pt-20 px-4">
        {/* Grainy texture overlay */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Grid lines */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
              linear-gradient(#CCFF00 1px, transparent 1px),
              linear-gradient(90deg, #CCFF00 1px, transparent 1px)
            `,
              backgroundSize: "80px 80px",
            }}
          />
        </div>

        {/* Login Form Container */}
        <div className="relative z-10 w-full max-w-md">
          {/* Corner Accents */}
          <div className="absolute -top-4 -left-4 w-8 h-8 border-t-4 border-l-4 border-[#CCFF00]" />
          <div className="absolute -top-4 -right-4 w-8 h-8 border-t-4 border-r-4 border-[#CCFF00]" />
          <div className="absolute -bottom-4 -left-4 w-8 h-8 border-b-4 border-l-4 border-[#CCFF00]" />
          <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-4 border-r-4 border-[#CCFF00]" />

          <div className="border-4 border-[#CCFF00] bg-[#0a0a0a] p-8 md:p-12">
            {/* Header */}
            <div className="text-center mb-10">
              <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tighter leading-none">
                {t.title}
                <br />
                <span className="text-[#CCFF00]">{t.titleAccent}</span>
              </h1>
              <p className="text-[#888888] text-sm uppercase tracking-[0.3em] mt-4">
                {t.subtitle}
              </p>
            </div>

            {/* Form */}
            <form className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-[#CCFF00] text-sm font-bold uppercase tracking-wider mb-2">
                  {t.email}
                </label>
                <input
                  type="email"
                  placeholder={t.emailPlaceholder}
                  className="w-full bg-transparent text-white text-lg py-3 border-b-4 border-[#CCFF00] focus:outline-none focus:border-white placeholder:text-[#444444] transition-colors"
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-[#CCFF00] text-sm font-bold uppercase tracking-wider mb-2">
                  {t.password}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={t.passwordPlaceholder}
                    className="w-full bg-transparent text-white text-lg py-3 border-b-4 border-[#CCFF00] focus:outline-none focus:border-white placeholder:text-[#444444] transition-colors pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-[#CCFF00] hover:text-white transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <Link
                  href="#"
                  className="text-[#888888] text-sm uppercase tracking-wider hover:text-[#CCFF00] transition-colors"
                >
                  {t.forgotPassword}
                </Link>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="w-full py-4 bg-[#CCFF00] text-[#0a0a0a] text-xl font-bold uppercase tracking-wider border-4 border-[#CCFF00] hover:bg-[#0a0a0a] hover:text-[#CCFF00] transition-colors"
              >
                {t.login}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 my-8">
                <div className="flex-1 h-1 bg-[#1a1a1a]" />
                <span className="text-[#888888] text-sm uppercase">OR</span>
                <div className="flex-1 h-1 bg-[#1a1a1a]" />
              </div>

              {/* Google Button with Glitch Effect */}
              <button
                type="button"
                onMouseEnter={() => setIsGoogleHovered(true)}
                onMouseLeave={() => setIsGoogleHovered(false)}
                className="relative w-full py-4 bg-[#0a0a0a] text-[#CCFF00] text-lg font-bold uppercase tracking-wider border-4 border-[#CCFF00] hover:bg-[#1a1a1a] transition-colors overflow-hidden group"
              >
                <span
                  className={`inline-block transition-transform ${isGoogleHovered ? "animate-glitch" : ""}`}
                  style={{
                    animation: isGoogleHovered ? "glitch 0.3s infinite" : "none",
                  }}
                >
                  {t.google}
                </span>
                {/* Glitch layers */}
                {isGoogleHovered && (
                  <>
                    <span
                      className="absolute inset-0 flex items-center justify-center text-[#ff0000] opacity-70"
                      style={{
                        clipPath: "polygon(0 0, 100% 0, 100% 45%, 0 45%)",
                        transform: "translate(-2px, 0)",
                      }}
                    >
                      {t.google}
                    </span>
                    <span
                      className="absolute inset-0 flex items-center justify-center text-[#00ffff] opacity-70"
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

            {/* Create Account */}
            <p className="text-center mt-8 text-[#888888] text-sm uppercase tracking-wider">
              {t.noAccount}{" "}
              <Link href="#" className="text-[#CCFF00] font-bold hover:text-white transition-colors">
                {t.createOne}
              </Link>
            </p>
          </div>
        </div>
      </section>

      <Footer language={language} />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        language={language}
      />

      {/* Glitch animation styles */}
      <style jsx>{`
        @keyframes glitch {
          0% {
            transform: translate(0);
          }
          20% {
            transform: translate(-3px, 3px);
          }
          40% {
            transform: translate(-3px, -3px);
          }
          60% {
            transform: translate(3px, 3px);
          }
          80% {
            transform: translate(3px, -3px);
          }
          100% {
            transform: translate(0);
          }
        }
      `}</style>
    </main>
  )
}
