import type { Locale } from "@/lib/i18n/types"

const toIntlLocale = (locale: Locale) => {
  if (locale === "KR") {
    return "ko-KR"
  }

  return "en-US"
}

export const formatDateByLocale = (
  value: string | number | Date,
  locale: Locale,
  options: Intl.DateTimeFormatOptions,
) => {
  return new Date(value).toLocaleDateString(toIntlLocale(locale), options)
}
