"use client"

import Link from "next/link"
import { ProductCard } from "./product-card"
import { products as allProducts, type Language } from "@/lib/products"

// Show first 8 products on homepage
const products = allProducts.slice(0, 8)

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
          <Link 
            href="/shop"
            className="self-start md:self-auto px-6 py-3 border-4 border-[#CCFF00] text-[#CCFF00] font-bold uppercase tracking-wider hover:bg-[#CCFF00] hover:text-[#0a0a0a] transition-colors"
          >
            {sectionText[language].button}
          </Link>
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
            showMatchBadge={false}
          />
        ))}
      </div>
    </section>
  )
}
