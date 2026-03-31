import type { Locale } from "@/lib/i18n/types"

type SupportedCurrency = "USD" | "KRW"

type ProductPriceInput = {
  locale: Locale
  usd: number
  krw: number
}

type StoredKrwAmountInput = {
  locale: Locale
  amountKrw: number
}

export const formatPriceByCurrency = (value: number, currency: SupportedCurrency) => {
  if (currency === "KRW") {
    return `${Math.round(value).toLocaleString()}원`
  }

  return `$${Math.round(value)}`
}

export const formatProductPriceByLocale = ({
  locale,
  usd,
  krw,
}: ProductPriceInput) => {
  if (locale === "KR") {
    return formatPriceByCurrency(krw, "KRW")
  }

  return formatPriceByCurrency(usd, "USD")
}

export const formatStoredKrwAmountByLocale = ({
  locale,
  amountKrw,
}: StoredKrwAmountInput) => {
  if (locale === "KR") {
    return formatPriceByCurrency(amountKrw, "KRW")
  }

  return formatPriceByCurrency(Math.max(1, Math.round(amountKrw / 1000)), "USD")
}
