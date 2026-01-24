"use client"

import { ProductCard } from "./product-card"

type Language = "EN" | "KR"

const products = [
  {
    name: "사이버 후디 3000",
    price: 189000,
    priceUSD: 189,
    aiMatch: 98,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=600&fit=crop",
    category: { EN: "HOODIES", KR: "후드" }
  },
  {
    name: "GLITCH CARGO PANTS",
    price: 145000,
    priceUSD: 145,
    aiMatch: 95,
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=600&fit=crop",
    category: { EN: "BOTTOMS", KR: "하의" }
  },
  {
    name: "네온 오버사이즈 티",
    price: 79000,
    priceUSD: 79,
    aiMatch: 97,
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=600&fit=crop",
    category: { EN: "TOPS", KR: "상의" }
  },
  {
    name: "VOID PUFFER JACKET",
    price: 299000,
    priceUSD: 299,
    aiMatch: 92,
    image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&h=600&fit=crop",
    category: { EN: "OUTERWEAR", KR: "아우터" }
  },
  {
    name: "매트릭스 트랙팬츠",
    price: 120000,
    priceUSD: 120,
    aiMatch: 94,
    image: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&h=600&fit=crop",
    category: { EN: "BOTTOMS", KR: "하의" }
  },
  {
    name: "STATIC CREWNECK",
    price: 95000,
    priceUSD: 95,
    aiMatch: 96,
    image: "https://images.unsplash.com/photo-1578681994506-b8f463449011?w=600&h=600&fit=crop",
    category: { EN: "TOPS", KR: "상의" }
  },
  {
    name: "바이너리 비니",
    price: 45000,
    priceUSD: 45,
    aiMatch: 99,
    image: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=600&h=600&fit=crop",
    category: { EN: "ACCESSORIES", KR: "악세서리" }
  },
  {
    name: "PIXEL VARSITY JACKET",
    price: 265000,
    priceUSD: 265,
    aiMatch: 93,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=600&fit=crop",
    category: { EN: "OUTERWEAR", KR: "아우터" }
  }
]

const sectionText = {
  EN: { subtitle: "CURATED FOR YOU", title: "HOT DROPS", button: "VIEW ALL" },
  KR: { subtitle: "당신을 위한 추천", title: "인기 신상", button: "전체 보기" }
}

export function ProductGrid({ language }: { language: Language }) {
  return (
    <section className="relative py-20 px-4 md:px-8 bg-[#0a0a0a]">
      {/* Section Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b-4 border-[#CCFF00] pb-6">
          <div>
            <p className="text-[#CCFF00] text-sm font-bold uppercase tracking-[0.3em] mb-2">
              {sectionText[language].subtitle}
            </p>
            <h2 className="text-4xl md:text-6xl font-bold text-white uppercase tracking-tighter">
              {sectionText[language].title}
            </h2>
          </div>
          <button className="self-start md:self-auto px-6 py-3 border-4 border-[#CCFF00] text-[#CCFF00] font-bold uppercase tracking-wider hover:bg-[#CCFF00] hover:text-[#0a0a0a] transition-colors">
            {sectionText[language].button}
          </button>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <ProductCard 
            key={index} 
            name={product.name}
            price={language === "KR" ? product.price : product.priceUSD}
            aiMatch={product.aiMatch}
            image={product.image}
            category={product.category[language]}
            currency={language === "KR" ? "KRW" : "USD"}
          />
        ))}
      </div>
    </section>
  )
}
