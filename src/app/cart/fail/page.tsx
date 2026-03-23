import Link from "next/link"
import { APP_URLS } from "@/constants/url"
import { NoiseOverlay } from "@/components/ui"
import { createSupabaseAdmin } from "@/lib/supabase/admin"

type FailPageProps = {
  searchParams: Promise<{
    code?: string
    message?: string
    orderId?: string
  }>
}

async function markOrderAsFailed(orderId?: string) {
  if (!orderId) return

  try {
    const supabase = createSupabaseAdmin()
    await supabase
      .from("orders")
      .update({
        payment_status: "failed",
        status: "cancelled",
      })
      .eq("order_number", orderId)
      .eq("payment_status", "pending")
  } catch (error) {
    console.error("[cart/fail] failed to mark order as failed", error)
  }
}

export default async function CartFailPage({ searchParams }: FailPageProps) {
  const resolvedSearchParams = await searchParams
  await markOrderAsFailed(resolvedSearchParams.orderId)

  const errorCode = resolvedSearchParams.code ?? "PAYMENT_FAILED"
  const errorMessage = resolvedSearchParams.message ?? "The payment was not completed."

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <section className="relative px-4 pb-20 pt-24 md:px-8">
        <NoiseOverlay />

        <div className="relative z-10 mx-auto max-w-3xl">
          <div className="border-4 border-[#ff6666] bg-[#0a0a0a] p-8 md:p-12">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#ff6666]">PAYMENT FAILED</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-6xl">
              TOSS PAYMENT DID NOT FINISH
            </h1>

            <div className="mt-8 space-y-3 border-2 border-[#333333] bg-[#111111] p-5 font-mono text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[#888888]">CODE</span>
                <span className="text-white">{errorCode}</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-[#888888]">MESSAGE</span>
                <span className="max-w-[70%] text-right text-white">{errorMessage}</span>
              </div>
            </div>

            <p className="mt-6 text-base leading-7 text-[#bbbbbb]">
              The payment was cancelled during authentication or the test approval failed. You can return to the cart and try again.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href={APP_URLS.cart}
                className="inline-flex items-center justify-center border-4 border-[#CCFF00] bg-[#CCFF00] px-6 py-4 text-sm font-bold uppercase tracking-[0.2em] text-[#0a0a0a] transition-colors hover:bg-[#0a0a0a] hover:text-[#CCFF00]"
              >
                Back To Cart
              </Link>
              <Link
                href={APP_URLS.shop}
                className="inline-flex items-center justify-center border-4 border-[#333333] px-6 py-4 text-sm font-bold uppercase tracking-[0.2em] text-[#bbbbbb] transition-colors hover:border-[#CCFF00] hover:text-[#CCFF00]"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
