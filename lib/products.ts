export type Language = "EN" | "KR"

export interface Product {
  id: string
  name: string
  price: number
  priceUSD: number
  aiMatch: number
  image: string
  category: { EN: string; KR: string }
  tags: string[]
}

export const products: Product[] = [
  // HOODIES
  {
    id: "hoodie-001",
    name: "사이버 후디 3000",
    price: 189000,
    priceUSD: 189,
    aiMatch: 98,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=600&fit=crop",
    category: { EN: "HOODIES", KR: "후드" },
    tags: ["#Cyber", "#Oversized", "#Neon"]
  },
  {
    id: "hoodie-002",
    name: "PHANTOM ZIP-UP",
    price: 215000,
    priceUSD: 215,
    aiMatch: 91,
    image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=600&fit=crop",
    category: { EN: "HOODIES", KR: "후드" },
    tags: ["#Minimal", "#Street", "#Utility"]
  },
  {
    id: "hoodie-003",
    name: "데이터 스트림 후디",
    price: 175000,
    priceUSD: 175,
    aiMatch: 87,
    image: "https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=600&h=600&fit=crop",
    category: { EN: "HOODIES", KR: "후드" },
    tags: ["#Cyber", "#Techwear", "#Neon"]
  },

  // JACKETS / OUTERWEAR
  {
    id: "jacket-001",
    name: "VOID PUFFER JACKET",
    price: 299000,
    priceUSD: 299,
    aiMatch: 92,
    image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&h=600&fit=crop",
    category: { EN: "OUTER", KR: "아우터" },
    tags: ["#Street", "#Utility", "#Gorpcore"]
  },
  {
    id: "jacket-002",
    name: "PIXEL VARSITY JACKET",
    price: 265000,
    priceUSD: 265,
    aiMatch: 93,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=600&fit=crop",
    category: { EN: "OUTER", KR: "아우터" },
    tags: ["#Street", "#Retro", "#Oversized"]
  },
  {
    id: "jacket-003",
    name: "테크 쉘 자켓",
    price: 345000,
    priceUSD: 345,
    aiMatch: 96,
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=600&fit=crop",
    category: { EN: "OUTER", KR: "아우터" },
    tags: ["#Techwear", "#Utility", "#Gorpcore"]
  },
  {
    id: "jacket-004",
    name: "NEON WINDBREAKER",
    price: 185000,
    priceUSD: 185,
    aiMatch: 89,
    image: "https://images.unsplash.com/photo-1559551409-dadc959f76b8?w=600&h=600&fit=crop",
    category: { EN: "OUTER", KR: "아우터" },
    tags: ["#Neon", "#Street", "#Y2K"]
  },

  // TOPS
  {
    id: "top-001",
    name: "네온 오버사이즈 티",
    price: 79000,
    priceUSD: 79,
    aiMatch: 97,
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=600&fit=crop",
    category: { EN: "TOPS", KR: "상의" },
    tags: ["#Neon", "#Oversized", "#Street"]
  },
  {
    id: "top-002",
    name: "STATIC CREWNECK",
    price: 95000,
    priceUSD: 95,
    aiMatch: 96,
    image: "https://images.unsplash.com/photo-1578681994506-b8f463449011?w=600&h=600&fit=crop",
    category: { EN: "TOPS", KR: "상의" },
    tags: ["#Minimal", "#Street", "#Cyber"]
  },
  {
    id: "top-003",
    name: "GLITCH GRAPHIC TEE",
    price: 65000,
    priceUSD: 65,
    aiMatch: 88,
    image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&h=600&fit=crop",
    category: { EN: "TOPS", KR: "상의" },
    tags: ["#Cyber", "#Street", "#Neon"]
  },
  {
    id: "top-004",
    name: "유틸리티 롱슬리브",
    price: 89000,
    priceUSD: 89,
    aiMatch: 84,
    image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=600&fit=crop",
    category: { EN: "TOPS", KR: "상의" },
    tags: ["#Utility", "#Minimal", "#Techwear"]
  },
  {
    id: "top-005",
    name: "MESH LAYER TOP",
    price: 72000,
    priceUSD: 72,
    aiMatch: 81,
    image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&h=600&fit=crop",
    category: { EN: "TOPS", KR: "상의" },
    tags: ["#Techwear", "#Cyber", "#Y2K"]
  },

  // BOTTOMS
  {
    id: "bottom-001",
    name: "GLITCH CARGO PANTS",
    price: 145000,
    priceUSD: 145,
    aiMatch: 95,
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=600&fit=crop",
    category: { EN: "BOTTOMS", KR: "하의" },
    tags: ["#Utility", "#Street", "#Techwear"]
  },
  {
    id: "bottom-002",
    name: "매트릭스 트랙팬츠",
    price: 120000,
    priceUSD: 120,
    aiMatch: 94,
    image: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&h=600&fit=crop",
    category: { EN: "BOTTOMS", KR: "하의" },
    tags: ["#Cyber", "#Street", "#Retro"]
  },
  {
    id: "bottom-003",
    name: "TACTICAL JOGGERS",
    price: 135000,
    priceUSD: 135,
    aiMatch: 90,
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&h=600&fit=crop",
    category: { EN: "BOTTOMS", KR: "하의" },
    tags: ["#Techwear", "#Utility", "#Gorpcore"]
  },
  {
    id: "bottom-004",
    name: "와이드 데님 팬츠",
    price: 155000,
    priceUSD: 155,
    aiMatch: 86,
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=600&fit=crop",
    category: { EN: "BOTTOMS", KR: "하의" },
    tags: ["#Street", "#Oversized", "#Retro"]
  },

  // ACCESSORIES
  {
    id: "acc-001",
    name: "바이너리 비니",
    price: 45000,
    priceUSD: 45,
    aiMatch: 99,
    image: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=600&h=600&fit=crop",
    category: { EN: "ACC", KR: "악세서리" },
    tags: ["#Cyber", "#Minimal", "#Street"]
  },
  {
    id: "acc-002",
    name: "TECH CROSSBODY BAG",
    price: 125000,
    priceUSD: 125,
    aiMatch: 92,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop",
    category: { EN: "ACC", KR: "악세서리" },
    tags: ["#Techwear", "#Utility", "#Gorpcore"]
  },
  {
    id: "acc-003",
    name: "네온 버킷햇",
    price: 55000,
    priceUSD: 55,
    aiMatch: 85,
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&h=600&fit=crop",
    category: { EN: "ACC", KR: "악세서리" },
    tags: ["#Neon", "#Street", "#Y2K"]
  },
  {
    id: "acc-004",
    name: "CYBER SOCKS PACK",
    price: 28000,
    priceUSD: 28,
    aiMatch: 78,
    image: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600&h=600&fit=crop",
    category: { EN: "ACC", KR: "악세서리" },
    tags: ["#Cyber", "#Neon", "#Minimal"]
  }
]

export const allTags = [
  "#Cyber", "#Street", "#Utility", "#Minimal", "#Neon", 
  "#Gorpcore", "#Techwear", "#Oversized", "#Retro", "#Y2K"
]

export const categories = {
  EN: ["ALL", "OUTER", "TOPS", "BOTTOMS", "HOODIES", "ACC"],
  KR: ["전체", "아우터", "상의", "하의", "후드", "악세서리"]
}

export const categoryMap: { [key: string]: string } = {
  "ALL": "ALL",
  "전체": "ALL",
  "OUTER": "OUTER",
  "아우터": "OUTER",
  "TOPS": "TOPS",
  "상의": "TOPS",
  "BOTTOMS": "BOTTOMS",
  "하의": "BOTTOMS",
  "HOODIES": "HOODIES",
  "후드": "HOODIES",
  "ACC": "ACC",
  "악세서리": "ACC"
}
