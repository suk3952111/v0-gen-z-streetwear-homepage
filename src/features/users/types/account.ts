export type AccountAddress = {
  id: string
  recipient_name: string
  phone: string
  address_line1: string
  address_line2: string
  city: string
  postal_code: string
  is_default: boolean
}

export type AccountOrderItem = {
  name: string
  quantity: number
}

export type AccountOrder = {
  id: string
  order_number: string
  status: string
  final_amount: number
  created_at: string
  items: AccountOrderItem[]
}

export type AccountProfile = {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  created_at: string
}

export type AccountOverview = {
  profile: AccountProfile
  addresses: AccountAddress[]
  orders: AccountOrder[]
}

