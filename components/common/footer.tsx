import Link from "next/link"

type Language = "EN" | "KR"

const footerContent = {
  EN: {
    tagline: "AI-powered streetwear that matches your energy. Built different.",
    shop: "SHOP",
    shopLinks: ["New Drops", "Tops", "Bottoms", "Accessories"],
    info: "INFO",
    infoLinks: ["About", "Shipping", "Returns", "Contact"],
    newsletter: "STAY UPDATED",
    emailPlaceholder: "YOUR EMAIL",
    joinBtn: "JOIN",
    copyright: "© 2026 VIBE CHECK. ALL RIGHTS RESERVED.",
    privacy: "Privacy",
    terms: "Terms"
  },
  KR: {
    tagline: "당신의 에너지에 맞는 AI 스트릿웨어. 남다른 감각.",
    shop: "쇼핑",
    shopLinks: ["신상품", "상의", "하의", "악세서리"],
    info: "정보",
    infoLinks: ["소개", "배송안내", "교환/반품", "문의하기"],
    newsletter: "소식 받기",
    emailPlaceholder: "이메일 주소",
    joinBtn: "구독",
    copyright: "© 2026 VIBE CHECK. ALL RIGHTS RESERVED.",
    privacy: "개인정보처리방침",
    terms: "이용약관"
  }
}

export function Footer({ language }: { language: Language }) {
  const content = footerContent[language]
  
  return (
    <footer className="border-t-4 border-[#CCFF00] bg-[#0a0a0a] py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="text-3xl font-bold text-[#CCFF00] tracking-tighter mb-4">
              VIBE CHECK
            </h3>
            <p className="text-white text-sm leading-relaxed">
              {content.tagline}
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-white text-lg font-bold uppercase tracking-wider mb-4 border-b-2 border-[#CCFF00] pb-2">
              {content.shop}
            </h4>
            <ul className="space-y-2">
              {content.shopLinks.map((link, i) => (
                <li key={i}><Link href="#" className="text-[#888888] hover:text-[#CCFF00] transition-colors uppercase text-sm">{link}</Link></li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-white text-lg font-bold uppercase tracking-wider mb-4 border-b-2 border-[#CCFF00] pb-2">
              {content.info}
            </h4>
            <ul className="space-y-2">
              {content.infoLinks.map((link, i) => (
                <li key={i}><Link href="#" className="text-[#888888] hover:text-[#CCFF00] transition-colors uppercase text-sm">{link}</Link></li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white text-lg font-bold uppercase tracking-wider mb-4 border-b-2 border-[#CCFF00] pb-2">
              {content.newsletter}
            </h4>
            <div className="flex">
              <input
                type="email"
                placeholder={content.emailPlaceholder}
                className="flex-1 px-4 py-3 bg-[#1a1a1a] text-white border-4 border-[#CCFF00] border-r-0 placeholder:text-[#888888] focus:outline-none text-sm uppercase"
              />
              <button className="px-4 py-3 bg-[#CCFF00] text-[#0a0a0a] font-bold uppercase border-4 border-[#CCFF00] hover:bg-[#0a0a0a] hover:text-[#CCFF00] transition-colors">
                {content.joinBtn}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t-2 border-[#1a1a1a]">
          <p className="text-[#888888] text-sm uppercase">
            {content.copyright}
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-[#888888] hover:text-[#CCFF00] transition-colors text-sm uppercase">
              {content.privacy}
            </Link>
            <Link href="#" className="text-[#888888] hover:text-[#CCFF00] transition-colors text-sm uppercase">
              {content.terms}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
