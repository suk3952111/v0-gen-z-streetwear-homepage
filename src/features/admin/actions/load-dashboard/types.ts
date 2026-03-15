export type AdminDashboardStats = {
  sales: number
  orders: number
  pending: number
  lowStock: number
}

export type AdminOrderRow = {
  id: string
  orderNumber: string
  customer: string
  status: string
  total: number
}

export type AdminDashboardPayload = {
  stats: AdminDashboardStats
  orders: AdminOrderRow[]
  page: number
  pageSize: number
  totalOrders: number
  totalPages: number
}

export type LoadAdminDashboardActionState = {
  success: boolean
  data: AdminDashboardPayload | null
  errorMessage?: string
}

