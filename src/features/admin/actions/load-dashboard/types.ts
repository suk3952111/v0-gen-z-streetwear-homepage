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
  createdAt?: string
}

export type AdminProductRow = {
  id: string
  name: string
  slug: string
  brand: string
  category: string
  basePrice: number
  isPublished: boolean
  isFeatured: boolean
  updatedAt: string
}

export type AdminInventoryRow = {
  id: string
  productName: string
  productSlug: string
  size: string
  stockQuantity: number
  isActive: boolean
  updatedAt: string
}

export type AdminActivityRow = {
  id: string
  actionType: string
  targetTable: string
  description: string | null
  actor: string
  createdAt: string
}

export type AdminSelectOption = {
  id: string
  name: string
}

export type AdminDashboardPayload = {
  stats: AdminDashboardStats
  orders: AdminOrderRow[]
  products: AdminProductRow[]
  lowStockItems: AdminInventoryRow[]
  activities: AdminActivityRow[]
  categories: AdminSelectOption[]
  brands: AdminSelectOption[]
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

