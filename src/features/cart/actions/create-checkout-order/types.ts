export type CreateCheckoutOrderPayload = {
  orderId: string
  orderNumber: string
  orderStatus: string
  paymentStatus: string
  totalAmount: number
}

export type CreateCheckoutOrderActionState = {
  success: boolean
  data: CreateCheckoutOrderPayload | null
  errorMessage?: string
}

