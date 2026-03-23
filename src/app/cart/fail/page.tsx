import { NoiseOverlay } from "@/components/ui"
import { PaymentResultView } from "@/features/cart/components/payment-result-view"
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
          <PaymentResultView mode="fail" errorCode={errorCode} errorMessage={errorMessage} />
        </div>
      </section>
    </main>
  )
}
