"use client"

import { ChevronRight, Package } from "lucide-react"
import { formatStoredKrwAmountByLocale } from "@/lib/format/currency"
import { formatDateByLocale } from "@/lib/format/date"
import type { Locale } from "@/lib/i18n/types"
import type { AccountOrder } from "@/features/users/types/account"
import type { AccountTranslator } from "./types"

type OrdersPanelProps = {
  locale: Locale
  orders: AccountOrder[]
  t: AccountTranslator
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "delivered":
      return "text-[#00FF88]"
    case "shipped":
      return "text-[#00CCFF]"
    case "confirmed":
      return "text-[#CCFF00]"
    case "pending":
      return "text-[#FFCC00]"
    case "cancelled":
      return "text-[#FF4444]"
    default:
      return "text-white"
  }
}

export function OrdersPanel({ locale, orders, t }: OrdersPanelProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white uppercase tracking-wider">
        {t("orders.title")}
      </h2>

      {orders.length === 0 ? (
        <div className="text-center py-16 border-4 border-dashed border-[#333333]">
          <Package className="w-16 h-16 text-[#333333] mx-auto mb-4" />
          <p className="text-[#888888] text-xl uppercase tracking-wider mb-2">
            {t("orders.noOrders")}
          </p>
          <p className="text-[#666666] text-sm">{t("orders.startShopping")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border-4 border-[#333333] hover:border-[#CCFF00] transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border-b-2 border-[#333333]">
                <div className="flex items-center gap-6">
                  {[
                    { label: t("orders.orderNumber"), value: order.order_number },
                    {
                      label: t("orders.date"),
                      value: formatDateByLocale(order.created_at, locale, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }),
                    },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-[#888888] text-xs uppercase">{label}</p>
                      <p className="text-white font-bold">{value}</p>
                    </div>
                  ))}

                  <div>
                    <p className="text-[#888888] text-xs uppercase">{t("orders.status")}</p>
                    <p className={`font-bold uppercase ${getStatusColor(order.status)}`}>
                      {t(`orders.statuses.${order.status}`)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[#888888] text-xs uppercase">{t("orders.total")}</p>
                  <p className="text-[#CCFF00] text-xl font-bold">
                    {formatStoredKrwAmountByLocale({
                      locale,
                      amountKrw: order.final_amount,
                    })}
                  </p>
                </div>
              </div>

              <div className="p-4">
                <p className="text-[#888888] text-xs uppercase mb-3">{t("orders.items")}</p>
                <div className="flex flex-wrap gap-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <p className="text-white text-sm font-bold uppercase max-w-[150px] truncate">
                        {item.name} x{item.quantity}
                      </p>
                    </div>
                  ))}
                </div>

                <button className="flex items-center gap-2 text-[#CCFF00] text-sm font-bold uppercase mt-4 hover:underline">
                  {t("orders.viewDetails")}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
