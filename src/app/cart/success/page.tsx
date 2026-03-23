import Link from "next/link"
import { APP_URLS } from "@/constants/url"
import { NoiseOverlay } from "@/components/ui"
import { createSupabaseAdmin } from "@/lib/supabase/admin"

type SuccessPageProps = {
  searchParams: Promise<{
    amount?: string
    orderId?: string
    paymentKey?: string
  }>
}

type ConfirmationResult =
  | {
      amount: number
      debug?: string[]
      message: string
      ok: true
      orderNumber: string
    }
  | {
      debug?: string[]
      message: string
      ok: false
    }

type OrderRow = {
  id: string
  order_number: string
  payment_status: "pending" | "completed" | "failed"
  shipping_fee: number | null
  user_id: string
}

type OrderItemRow = {
  quantity: number
  unit_price: number
}

type TossConfirmResponse = {
  method?: string
}

const getOrderAmount = (items: OrderItemRow[], shippingFee: number) => {
  const itemsTotal = items.reduce((sum, item) => {
    return sum + Number(item.quantity ?? 0) * Number(item.unit_price ?? 0)
  }, 0)

  return itemsTotal + shippingFee
}

async function confirmTossPayment(searchParams: Awaited<SuccessPageProps["searchParams"]>): Promise<ConfirmationResult> {
  const debug: string[] = []

  try {
    const paymentKey = searchParams.paymentKey
    const orderId = searchParams.orderId
    const amountParam = searchParams.amount

    debug.push(`orderId=${orderId ?? "missing"}`)
    debug.push(`paymentKey=${paymentKey ?? "missing"}`)
    debug.push(`amount=${amountParam ?? "missing"}`)

    if (!paymentKey || !orderId || !amountParam) {
      return {
        ok: false,
        message: "Missing payment confirmation parameters.",
        debug,
      }
    }

    const amount = Number(amountParam)
    if (!Number.isFinite(amount)) {
      return {
        ok: false,
        message: "Invalid payment amount.",
        debug,
      }
    }

    const secretKey = process.env.TOSS_SECRET_KEY
    if (!secretKey) {
      return {
        ok: false,
        message: "Missing Toss Payments secret key on the server.",
        debug,
      }
    }

    const supabase = createSupabaseAdmin()
    debug.push("supabaseAdmin=ready")

    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("id, order_number, payment_status, shipping_fee, user_id")
      .eq("order_number", orderId)
      .maybeSingle()

    if (orderError) {
      return {
        ok: false,
        message: orderError.message,
        debug,
      }
    }

    const order = orderData as OrderRow | null
    if (!order) {
      return {
        ok: false,
        message: "Order not found.",
        debug,
      }
    }

    debug.push(`orderDbId=${order.id}`)
    debug.push(`paymentStatus=${order.payment_status}`)

    const { data: itemRows, error: itemError } = await supabase
      .from("order_items")
      .select("quantity, unit_price")
      .eq("order_id", order.id)

    if (itemError) {
      return {
        ok: false,
        message: itemError.message,
        debug,
      }
    }

    const expectedAmount = getOrderAmount((itemRows ?? []) as OrderItemRow[], Number(order.shipping_fee ?? 0))
    debug.push(`expectedAmount=${expectedAmount}`)

    if (expectedAmount !== amount) {
      await supabase
        .from("orders")
        .update({
          payment_status: "failed",
          status: "cancelled",
        })
        .eq("id", order.id)

      return {
        ok: false,
        message: "Payment amount verification failed. Please try again.",
        debug,
      }
    }

    if (order.payment_status === "completed") {
      return {
        ok: true,
        orderNumber: order.order_number,
        amount: expectedAmount,
        message: "This order has already been paid.",
        debug,
      }
    }

    const authorization = Buffer.from(`${secretKey}:`).toString("base64")
    const confirmResponse = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: `Basic ${authorization}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
      cache: "no-store",
    })

    debug.push(`confirmStatus=${confirmResponse.status}`)

    if (!confirmResponse.ok) {
      const errorBody = await confirmResponse.json().catch(() => null) as { code?: string; message?: string } | null

      await supabase
        .from("orders")
        .update({
          payment_status: "failed",
          status: "cancelled",
        })
        .eq("id", order.id)

      if (errorBody?.code) {
        debug.push(`tossCode=${errorBody.code}`)
      }

      return {
        ok: false,
        message: errorBody?.message ?? "Toss payment confirmation failed.",
        debug,
      }
    }

    const confirmedPayment = await confirmResponse.json() as TossConfirmResponse

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_method: confirmedPayment.method ?? "CARD",
        payment_status: "completed",
        status: "confirmed",
        paid_at: new Date().toISOString(),
      })
      .eq("id", order.id)

    if (updateError) {
      return {
        ok: false,
        message: updateError.message,
        debug,
      }
    }

    await supabase.from("cart_items").delete().eq("user_id", order.user_id)

    return {
      ok: true,
      orderNumber: order.order_number,
      amount: expectedAmount,
      message: "Payment was confirmed successfully.",
      debug,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected payment confirmation error."
    return {
      ok: false,
      message,
      debug,
    }
  }
}

export default async function CartSuccessPage({ searchParams }: SuccessPageProps) {
  const resolvedSearchParams = await searchParams
  const result = await confirmTossPayment(resolvedSearchParams)

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <section className="relative px-4 pb-20 pt-24 md:px-8">
        <NoiseOverlay />

        <div className="relative z-10 mx-auto max-w-3xl">
          <div className="border-4 border-[#CCFF00] bg-[#0a0a0a] p-8 md:p-12">
            <p className={`text-sm font-bold uppercase tracking-[0.3em] ${result.ok ? "text-[#00FF88]" : "text-[#ff6666]"}`}>
              {result.ok ? "PAYMENT SUCCESS" : "PAYMENT FAILED"}
            </p>

            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-6xl">
              {result.ok ? "TOSS PAYMENT COMPLETE" : "PAYMENT COULD NOT BE CONFIRMED"}
            </h1>

            <p className="mt-6 text-base leading-7 text-[#bbbbbb]">{result.message}</p>

            {!!result.debug?.length && (
              <div className="mt-6 space-y-2 border-2 border-[#333333] bg-[#111111] p-5 font-mono text-xs">
                {result.debug.map((line) => (
                  <p key={line} className="break-all text-[#888888]">
                    {line}
                  </p>
                ))}
              </div>
            )}

            {result.ok && (
              <div className="mt-8 space-y-3 border-2 border-[#333333] bg-[#111111] p-5 font-mono text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[#888888]">ORDER</span>
                  <span className="text-white">{result.orderNumber}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[#888888]">AMOUNT</span>
                  <span className="text-white">{Math.round(result.amount).toLocaleString()} KRW</span>
                </div>
              </div>
            )}

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href={APP_URLS.account}
                className="inline-flex items-center justify-center border-4 border-[#CCFF00] bg-[#CCFF00] px-6 py-4 text-sm font-bold uppercase tracking-[0.2em] text-[#0a0a0a] transition-colors hover:bg-[#0a0a0a] hover:text-[#CCFF00]"
              >
                View Orders
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
