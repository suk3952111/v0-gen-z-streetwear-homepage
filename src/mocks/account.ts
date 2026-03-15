export const mockUser = {
  id: "user-001",
  email: "vibe_user@vibecheck.com",
  full_name: "CYBER KID",
  phone: "+82 10-1234-5678",
  avatar_url: null,
  is_admin: false,
  is_active: true,
  created_at: "2024-01-01T00:00:00Z",
  last_sign_in_at: "2024-01-20T10:30:00Z",
}

export const mockAddresses = [
  {
    id: "addr-001",
    recipient_name: "홍길동",
    phone: "010-1234-5678",
    address_line1: "서울시 강남구 테헤란로 123",
    address_line2: "바이브 빌딩 5층",
    city: "서울",
    postal_code: "06123",
    is_default: true,
  },
  {
    id: "addr-002",
    recipient_name: "CYBER KID",
    phone: "010-9876-5432",
    address_line1: "서울시 마포구 연남동 12-3",
    address_line2: "스트리트웨어 하우스",
    city: "서울",
    postal_code: "04001",
    is_default: false,
  },
]

export const mockOrders = [
  {
    id: "order-001",
    order_number: "VC-2024-001234",
    status: "delivered",
    total_amount: 189,
    final_amount: 189,
    created_at: "2024-01-15T10:30:00Z",
    items: [
      { name: "CYBER HOODIE 3000", quantity: 1, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=100&h=100&fit=crop" },
    ],
  },
  {
    id: "order-002",
    order_number: "VC-2024-001235",
    status: "shipped",
    total_amount: 410,
    final_amount: 410,
    created_at: "2024-01-18T14:20:00Z",
    items: [
      { name: "GLITCH CARGO PANTS", quantity: 2, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=100&h=100&fit=crop" },
      { name: "BINARY BEANIE", quantity: 1, image: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=100&h=100&fit=crop" },
    ],
  },
  {
    id: "order-003",
    order_number: "VC-2024-001236",
    status: "pending",
    total_amount: 265,
    final_amount: 265,
    created_at: "2024-01-20T09:00:00Z",
    items: [
      { name: "PIXEL VARSITY JACKET", quantity: 1, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=100&h=100&fit=crop" },
    ],
  },
]
