export type CreateCheckoutOrderPayload = {
  orderId: string
  orderNumber: string
  orderName: string
  totalAmount: number
  customerKey: string
  customerEmail: string | null
  customerName: string | null
}

export type CreateCheckoutOrderActionState = {
  success: boolean
  data: CreateCheckoutOrderPayload | null
  errorMessage?: string
}

