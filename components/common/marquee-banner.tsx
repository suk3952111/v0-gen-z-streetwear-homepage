"use client"

type Language = "EN" | "KR"

const marqueeText = {
  EN: "FREE SHIPPING ON ORDERS $150+ • AI PICKS JUST FOR YOU • NEW DROPS EVERY FRIDAY • ",
  KR: "15만원 이상 무료배송 • AI가 추천하는 나만의 핏 • 매주 금요일 신상 드랍 • "
}

export function MarqueeBanner({ language }: { language: Language }) {
  const text = marqueeText[language]
  
  return (
    <div className="relative overflow-hidden border-y-4 border-[#CCFF00] bg-[#CCFF00] py-3">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...Array(4)].map((_, i) => (
          <span key={i} className="text-[#0a0a0a] text-sm md:text-base font-bold uppercase tracking-wider mx-4">
            {text}
          </span>
        ))}
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  )
}
