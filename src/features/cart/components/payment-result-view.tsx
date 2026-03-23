"use client"

import Link from "next/link"
import { APP_URLS } from "@/constants/url"
import { useI18n } from "@/lib/i18n/use-i18n"

type SuccessResult = {
  amount: number
  debug?: string[]
  message: string
  ok: true
  orderNumber: string
}

type FailureResult = {
  debug?: string[]
  message: string
  ok: false
}

type PaymentResultViewProps = {
  mode: "success" | "fail"
  result?: SuccessResult | FailureResult
  errorCode?: string
  errorMessage?: string
}

export function PaymentResultView({ mode, result, errorCode, errorMessage }: PaymentResultViewProps) {
  const { locale, t } = useI18n("cart")

  const success = mode === "success" && result?.ok
  const badgeText = success ? t("successBadge") : t("failureBadge")
  const titleText = mode === "fail"
    ? t("failPageTitle")
    : success
      ? t("successTitle")
      : t("failureTitle")

  const bodyMessage = success
    ? t(result.message === "This order has already been paid." ? "alreadyPaidMessage" : "successMessage")
    : errorMessage ?? result?.message ?? t("paymentLaunchFailed")

  return (
    <div className={`border-4 ${success ? "border-[#CCFF00]" : "border-[#ff6666]"} bg-[#0a0a0a] p-8 md:p-12`}>
      <p className={`text-sm font-bold uppercase tracking-[0.3em] ${success ? "text-[#00FF88]" : "text-[#ff6666]"}`}>
        {badgeText}
      </p>

      <h1 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-6xl">{titleText}</h1>

      <p className="mt-6 text-base leading-7 text-[#bbbbbb]">
        {mode === "fail" ? t("failDescription") : bodyMessage}
      </p>

      {mode === "success" && success && (
        <div className="mt-8 space-y-3 border-2 border-[#333333] bg-[#111111] p-5 font-mono text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[#888888]">{t("orderLabel")}</span>
            <span className="text-white">{result.orderNumber}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[#888888]">{t("amountLabel")}</span>
            <span className="text-white">
              {locale === "KR" ? `${Math.round(result.amount).toLocaleString()}원` : `${Math.round(result.amount).toLocaleString()} KRW`}
            </span>
          </div>
        </div>
      )}

      {mode === "fail" && (
        <div className="mt-8 space-y-3 border-2 border-[#333333] bg-[#111111] p-5 font-mono text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[#888888]">{t("codeLabel")}</span>
            <span className="text-white">{errorCode ?? "PAYMENT_FAILED"}</span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <span className="text-[#888888]">{t("messageLabel")}</span>
            <span className="max-w-[70%] text-right text-white">{bodyMessage}</span>
          </div>
        </div>
      )}

      {!!result?.debug?.length && (
        <div className="mt-6 space-y-2 border-2 border-[#333333] bg-[#111111] p-5 font-mono text-xs">
          {result.debug.map((line) => (
            <p key={line} className="break-all text-[#888888]">
              {line}
            </p>
          ))}
        </div>
      )}

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link
          href={mode === "fail" ? APP_URLS.cart : APP_URLS.account}
          className="inline-flex items-center justify-center border-4 border-[#CCFF00] bg-[#CCFF00] px-6 py-4 text-sm font-bold uppercase tracking-[0.2em] text-[#0a0a0a] transition-colors hover:bg-[#0a0a0a] hover:text-[#CCFF00]"
        >
          {mode === "fail" ? t("backToCart") : t("viewOrders")}
        </Link>
        <Link
          href={APP_URLS.shop}
          className="inline-flex items-center justify-center border-4 border-[#333333] px-6 py-4 text-sm font-bold uppercase tracking-[0.2em] text-[#bbbbbb] transition-colors hover:border-[#CCFF00] hover:text-[#CCFF00]"
        >
          {t("continueShop")}
        </Link>
      </div>
    </div>
  )
}
