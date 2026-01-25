"use client"

import { ArrowDown } from "lucide-react"

type Language = "EN" | "KR"

const content = {
  EN: {
    subtitle: "AI-CURATED STREETWEAR",
    tagline: "THE FIT FINDER THAT ACTUALLY GETS YOU.",
    taglineAccent: "NO CAP.",
    shopBtn: "SHOP DROPS",
    quizBtn: "AI STYLE QUIZ"
  },
  KR: {
    subtitle: "AI 큐레이션 스트릿웨어",
    tagline: "너만의 스타일을 찾아주는",
    taglineAccent: "찐 핏 파인더.",
    shopBtn: "쇼핑하기",
    quizBtn: "AI 스타일 퀴즈"
  }
}

export function HeroSection({ language }: { language: Language }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Grainy texture overlay */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Animated grid lines */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(#CCFF00 1px, transparent 1px),
            linear-gradient(90deg, #CCFF00 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
        <p className="text-[#CCFF00] text-lg md:text-xl font-bold uppercase tracking-[0.3em] mb-4">
          {content[language].subtitle}
        </p>
        
        <h1 className="text-6xl sm:text-8xl md:text-9xl lg:text-[12rem] font-bold text-white leading-none tracking-tighter mb-6">
          VIBE
          <br />
          <span className="text-[#CCFF00]">CHECK</span>
        </h1>
        
        <p className="text-white text-xl md:text-2xl font-medium max-w-2xl mx-auto mb-8 leading-relaxed">
          {content[language].tagline}
          <br />
          <span className="text-[#CCFF00]">{content[language].taglineAccent}</span>
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="px-8 py-4 bg-[#CCFF00] text-[#0a0a0a] text-lg font-bold uppercase tracking-wider border-4 border-[#CCFF00] hover:bg-[#0a0a0a] hover:text-[#CCFF00] transition-colors">
            {content[language].shopBtn}
          </button>
          <button className="px-8 py-4 bg-transparent text-[#CCFF00] text-lg font-bold uppercase tracking-wider border-4 border-[#CCFF00] hover:bg-[#CCFF00] hover:text-[#0a0a0a] transition-colors">
            {content[language].quizBtn}
          </button>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ArrowDown className="w-8 h-8 text-[#CCFF00]" />
        </div>
      </div>

      {/* Corner accents */}
      <div className="absolute top-24 left-4 w-16 h-16 border-l-4 border-t-4 border-[#CCFF00]" />
      <div className="absolute top-24 right-4 w-16 h-16 border-r-4 border-t-4 border-[#CCFF00]" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-l-4 border-b-4 border-[#CCFF00]" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-r-4 border-b-4 border-[#CCFF00]" />
    </section>
  )
}
