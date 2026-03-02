"use client"

import Link from "next/link"
import { ProductCard } from "@/features/products/components/shared/product-card"
import { useI18n } from "@/lib/i18n/use-i18n"
import type { ShopProductItem } from "@/features/products/types/shop"

type ProductGridProps = {
  products: ShopProductItem[]
  language?: "EN" | "KR"
}

export function ProductGrid({ products }: ProductGridProps) {
  const { locale, t } = useI18n("products.home.grid")

  return (
    <section className="relative py-20 px-4 md:px-8 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b-4 border-[#CCFF00] pb-6">
          <div>
            <p className="text-[#CCFF00] text-sm font-bold uppercase tracking-[0.3em] mb-2">{t("subtitle")}</p>
            <h2 className="text-4xl md:text-6xl font-bold text-white uppercase tracking-tighter">{t("title")}</h2>
          </div>
          <Link href="/shop" className="self-start md:self-auto px-6 py-3 border-4 border-[#CCFF00] text-[#CCFF00] font-bold uppercase tracking-wider hover:bg-[#CCFF00] hover:text-[#0a0a0a] transition-colors">
            {t("button")}
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={locale === "KR" ? product.priceKRW : product.priceUSD}
            aiMatch={product.aiMatch}
            image={product.image}
            category={product.category[locale]}
            currency={locale === "KR" ? "KRW" : "USD"}
            showMatchBadge={false}
          />
        ))}
      </div>
    </section>
  )
}
