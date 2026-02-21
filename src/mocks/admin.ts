export type AdminOrder = {
  id: string
  orderNumber: string
  customer: string
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
  total: number
}

export const mockStats = {
  sales: 12450000,
  orders: 156,
  pending: 12,
  lowStock: 8,
}

export const mockOrders: AdminOrder[] = [
  { id: "order-001", orderNumber: "VC-2024-001234", customer: "홍길동", status: "pending", total: 189000 },
  { id: "order-002", orderNumber: "VC-2024-001235", customer: "CYBER_KID", status: "shipped", total: 410000 },
  { id: "order-003", orderNumber: "VC-2024-001236", customer: "스트릿워리어", status: "delivered", total: 265000 },
  { id: "order-004", orderNumber: "VC-2024-001237", customer: "TECHWEAR_FAN", status: "cancelled", total: 145000 },
]
