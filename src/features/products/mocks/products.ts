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
  // 후디 (12개)
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
  {
    id: "hoodie-004",
    name: "VOID OVERSIZED HOODIE",
    price: 168000,
    priceUSD: 168,
    aiMatch: 94,
    image: "https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=600&h=600&fit=crop",
    category: { EN: "HOODIES", KR: "후드" },
    tags: ["#Oversized", "#Minimal", "#Street"]
  },
  {
    id: "hoodie-005",
    name: "글리치 크롭 후디",
    price: 145000,
    priceUSD: 145,
    aiMatch: 89,
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=600&fit=crop",
    category: { EN: "HOODIES", KR: "후드" },
    tags: ["#Street", "#Y2K", "#Neon"]
  },
  {
    id: "hoodie-006",
    name: "MATRIX PULLOVER",
    price: 195000,
    priceUSD: 195,
    aiMatch: 92,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop",
    category: { EN: "HOODIES", KR: "후드" },
    tags: ["#Cyber", "#Techwear", "#Utility"]
  },
  {
    id: "hoodie-007",
    name: "테크노 박시 후드",
    price: 178000,
    priceUSD: 178,
    aiMatch: 86,
    image: "https://images.unsplash.com/photo-1542406775-ade58c52d2e4?w=600&h=600&fit=crop",
    category: { EN: "HOODIES", KR: "후드" },
    tags: ["#Techwear", "#Oversized", "#Gorpcore"]
  },
  {
    id: "hoodie-008",
    name: "NEON SPLIT HOODIE",
    price: 225000,
    priceUSD: 225,
    aiMatch: 95,
    image: "https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?w=600&h=600&fit=crop",
    category: { EN: "HOODIES", KR: "후드" },
    tags: ["#Neon", "#Street", "#Y2K"]
  },
  {
    id: "hoodie-009",
    name: "빈티지 워시드 후디",
    price: 155000,
    priceUSD: 155,
    aiMatch: 83,
    image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&h=600&fit=crop",
    category: { EN: "HOODIES", KR: "후드" },
    tags: ["#Retro", "#Street", "#Oversized"]
  },
  {
    id: "hoodie-010",
    name: "CYBER PUNK ZIP",
    price: 245000,
    priceUSD: 245,
    aiMatch: 97,
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=600&fit=crop",
    category: { EN: "HOODIES", KR: "후드" },
    tags: ["#Cyber", "#Neon", "#Techwear"]
  },
  {
    id: "hoodie-011",
    name: "스트릿 블록 후디",
    price: 162000,
    priceUSD: 162,
    aiMatch: 88,
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&h=600&fit=crop",
    category: { EN: "HOODIES", KR: "후드" },
    tags: ["#Street", "#Minimal", "#Utility"]
  },
  {
    id: "hoodie-012",
    name: "ACID WASH HOODIE",
    price: 185000,
    priceUSD: 185,
    aiMatch: 84,
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=600&fit=crop",
    category: { EN: "HOODIES", KR: "후드" },
    tags: ["#Retro", "#Y2K", "#Street"]
  },

  // 재킷 / 아우터 (12개)
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
  {
    id: "jacket-005",
    name: "고프코어 패딩",
    price: 389000,
    priceUSD: 389,
    aiMatch: 94,
    image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&h=600&fit=crop",
    category: { EN: "OUTER", KR: "아우터" },
    tags: ["#Gorpcore", "#Utility", "#Oversized"]
  },
  {
    id: "jacket-006",
    name: "CYBER TRENCH COAT",
    price: 425000,
    priceUSD: 425,
    aiMatch: 91,
    image: "https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=600&h=600&fit=crop",
    category: { EN: "OUTER", KR: "아우터" },
    tags: ["#Cyber", "#Techwear", "#Minimal"]
  },
  {
    id: "jacket-007",
    name: "레트로 트랙 재킷",
    price: 175000,
    priceUSD: 175,
    aiMatch: 87,
    image: "https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=600&h=600&fit=crop",
    category: { EN: "OUTER", KR: "아우터" },
    tags: ["#Retro", "#Street", "#Y2K"]
  },
  {
    id: "jacket-008",
    name: "TACTICAL FIELD JACKET",
    price: 315000,
    priceUSD: 315,
    aiMatch: 95,
    image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&h=600&fit=crop",
    category: { EN: "OUTER", KR: "아우터" },
    tags: ["#Techwear", "#Utility", "#Gorpcore"]
  },
  {
    id: "jacket-009",
    name: "오버핏 데님 자켓",
    price: 195000,
    priceUSD: 195,
    aiMatch: 82,
    image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&h=600&fit=crop",
    category: { EN: "OUTER", KR: "아우터" },
    tags: ["#Street", "#Retro", "#Oversized"]
  },
  {
    id: "jacket-010",
    name: "MESH UTILITY VEST",
    price: 145000,
    priceUSD: 145,
    aiMatch: 88,
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=600&fit=crop",
    category: { EN: "OUTER", KR: "아우터" },
    tags: ["#Utility", "#Techwear", "#Street"]
  },
  {
    id: "jacket-011",
    name: "네온 레이싱 자켓",
    price: 275000,
    priceUSD: 275,
    aiMatch: 96,
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=600&fit=crop&sat=-100&exp=10",
    category: { EN: "OUTER", KR: "아우터" },
    tags: ["#Neon", "#Y2K", "#Street"]
  },
  {
    id: "jacket-012",
    name: "STEALTH BOMBER",
    price: 355000,
    priceUSD: 355,
    aiMatch: 93,
    image: "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=600&h=600&fit=crop",
    category: { EN: "OUTER", KR: "아우터" },
    tags: ["#Minimal", "#Street", "#Techwear"]
  },

  // 상의 (15개)
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
  {
    id: "top-006",
    name: "사이버 프린트 티",
    price: 58000,
    priceUSD: 58,
    aiMatch: 92,
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=600&fit=crop",
    category: { EN: "TOPS", KR: "상의" },
    tags: ["#Cyber", "#Neon", "#Street"]
  },
  {
    id: "top-007",
    name: "OVERSIZED POLO",
    price: 85000,
    priceUSD: 85,
    aiMatch: 79,
    image: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&h=600&fit=crop",
    category: { EN: "TOPS", KR: "상의" },
    tags: ["#Retro", "#Oversized", "#Minimal"]
  },
  {
    id: "top-008",
    name: "스트라이프 럭비 티",
    price: 92000,
    priceUSD: 92,
    aiMatch: 85,
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=600&fit=crop",
    category: { EN: "TOPS", KR: "상의" },
    tags: ["#Retro", "#Street", "#Oversized"]
  },
  {
    id: "top-009",
    name: "TECH TANK TOP",
    price: 48000,
    priceUSD: 48,
    aiMatch: 77,
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&h=600&fit=crop",
    category: { EN: "TOPS", KR: "상의" },
    tags: ["#Techwear", "#Minimal", "#Utility"]
  },
  {
    id: "top-010",
    name: "빈티지 그래픽 티",
    price: 68000,
    priceUSD: 68,
    aiMatch: 90,
    image: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=600&h=600&fit=crop",
    category: { EN: "TOPS", KR: "상의" },
    tags: ["#Retro", "#Street", "#Y2K"]
  },
  {
    id: "top-011",
    name: "NEON CROP TOP",
    price: 55000,
    priceUSD: 55,
    aiMatch: 93,
    image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600&h=600&fit=crop",
    category: { EN: "TOPS", KR: "상의" },
    tags: ["#Neon", "#Y2K", "#Street"]
  },
  {
    id: "top-012",
    name: "테크 컴프레션 탑",
    price: 78000,
    priceUSD: 78,
    aiMatch: 86,
    image: "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600&h=600&fit=crop",
    category: { EN: "TOPS", KR: "상의" },
    tags: ["#Techwear", "#Utility", "#Cyber"]
  },
  {
    id: "top-013",
    name: "DOUBLE LAYER TEE",
    price: 75000,
    priceUSD: 75,
    aiMatch: 82,
    image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&h=600&fit=crop",
    category: { EN: "TOPS", KR: "상의" },
    tags: ["#Street", "#Minimal", "#Oversized"]
  },
  {
    id: "top-014",
    name: "하이넥 스웨터",
    price: 115000,
    priceUSD: 115,
    aiMatch: 87,
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=600&fit=crop",
    category: { EN: "TOPS", KR: "상의" },
    tags: ["#Minimal", "#Gorpcore", "#Utility"]
  },
  {
    id: "top-015",
    name: "REFLECTIVE JERSEY",
    price: 98000,
    priceUSD: 98,
    aiMatch: 94,
    image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&h=600&fit=crop",
    category: { EN: "TOPS", KR: "상의" },
    tags: ["#Neon", "#Techwear", "#Street"]
  },

  // 하의 (12개)
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
  {
    id: "bottom-005",
    name: "CYBER SHORTS",
    price: 85000,
    priceUSD: 85,
    aiMatch: 88,
    image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&h=600&fit=crop",
    category: { EN: "BOTTOMS", KR: "하의" },
    tags: ["#Cyber", "#Street", "#Neon"]
  },
  {
    id: "bottom-006",
    name: "유틸리티 쇼츠",
    price: 78000,
    priceUSD: 78,
    aiMatch: 83,
    image: "https://images.unsplash.com/photo-1598522325074-042db73aa4e6?w=600&h=600&fit=crop",
    category: { EN: "BOTTOMS", KR: "하의" },
    tags: ["#Utility", "#Gorpcore", "#Minimal"]
  },
  {
    id: "bottom-007",
    name: "PARACHUTE PANTS",
    price: 165000,
    priceUSD: 165,
    aiMatch: 92,
    image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&h=600&fit=crop",
    category: { EN: "BOTTOMS", KR: "하의" },
    tags: ["#Y2K", "#Street", "#Oversized"]
  },
  {
    id: "bottom-008",
    name: "테크 스웻팬츠",
    price: 98000,
    priceUSD: 98,
    aiMatch: 89,
    image: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&h=600&fit=crop&sat=-50",
    category: { EN: "BOTTOMS", KR: "하의" },
    tags: ["#Techwear", "#Minimal", "#Utility"]
  },
  {
    id: "bottom-009",
    name: "NEON STRIPE PANTS",
    price: 142000,
    priceUSD: 142,
    aiMatch: 96,
    image: "https://images.unsplash.com/photo-1519235624215-85175d5eb36e?w=600&h=600&fit=crop",
    category: { EN: "BOTTOMS", KR: "하의" },
    tags: ["#Neon", "#Street", "#Y2K"]
  },
  {
    id: "bottom-010",
    name: "카고 스커트",
    price: 118000,
    priceUSD: 118,
    aiMatch: 85,
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=600&fit=crop",
    category: { EN: "BOTTOMS", KR: "하의" },
    tags: ["#Utility", "#Street", "#Y2K"]
  },
  {
    id: "bottom-011",
    name: "RIPSTOP PANTS",
    price: 158000,
    priceUSD: 158,
    aiMatch: 91,
    image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=600&fit=crop",
    category: { EN: "BOTTOMS", KR: "하의" },
    tags: ["#Techwear", "#Gorpcore", "#Utility"]
  },
  {
    id: "bottom-012",
    name: "레트로 트레이닝복",
    price: 125000,
    priceUSD: 125,
    aiMatch: 84,
    image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&h=600&fit=crop",
    category: { EN: "BOTTOMS", KR: "하의" },
    tags: ["#Retro", "#Street", "#Oversized"]
  },

  // 액세서리 (15개)
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
  },
  {
    id: "acc-005",
    name: "테크 백팩",
    price: 185000,
    priceUSD: 185,
    aiMatch: 94,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop",
    category: { EN: "ACC", KR: "악세서리" },
    tags: ["#Techwear", "#Utility", "#Gorpcore"]
  },
  {
    id: "acc-006",
    name: "CHAIN NECKLACE",
    price: 68000,
    priceUSD: 68,
    aiMatch: 87,
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop",
    category: { EN: "ACC", KR: "악세서리" },
    tags: ["#Street", "#Y2K", "#Cyber"]
  },
  {
    id: "acc-007",
    name: "고프코어 캡",
    price: 52000,
    priceUSD: 52,
    aiMatch: 81,
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&h=600&fit=crop",
    category: { EN: "ACC", KR: "악세서리" },
    tags: ["#Gorpcore", "#Utility", "#Minimal"]
  },
  {
    id: "acc-008",
    name: "TACTICAL BELT",
    price: 75000,
    priceUSD: 75,
    aiMatch: 89,
    image: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600&h=600&fit=crop",
    category: { EN: "ACC", KR: "악세서리" },
    tags: ["#Techwear", "#Utility", "#Street"]
  },
  {
    id: "acc-009",
    name: "네온 선글라스",
    price: 95000,
    priceUSD: 95,
    aiMatch: 93,
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=600&fit=crop",
    category: { EN: "ACC", KR: "악세서리" },
    tags: ["#Neon", "#Y2K", "#Cyber"]
  },
  {
    id: "acc-010",
    name: "CYBER GLOVES",
    price: 48000,
    priceUSD: 48,
    aiMatch: 86,
    image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&h=600&fit=crop",
    category: { EN: "ACC", KR: "악세서리" },
    tags: ["#Cyber", "#Techwear", "#Utility"]
  },
  {
    id: "acc-011",
    name: "스트릿 스카프",
    price: 62000,
    priceUSD: 62,
    aiMatch: 79,
    image: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600&h=600&fit=crop",
    category: { EN: "ACC", KR: "악세서리" },
    tags: ["#Street", "#Retro", "#Minimal"]
  },
  {
    id: "acc-012",
    name: "UTILITY POUCH",
    price: 58000,
    priceUSD: 58,
    aiMatch: 84,
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop",
    category: { EN: "ACC", KR: "악세서리" },
    tags: ["#Utility", "#Gorpcore", "#Techwear"]
  },
  {
    id: "acc-013",
    name: "레트로 워치",
    price: 145000,
    priceUSD: 145,
    aiMatch: 88,
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=600&fit=crop",
    category: { EN: "ACC", KR: "악세서리" },
    tags: ["#Retro", "#Cyber", "#Minimal"]
  },
  {
    id: "acc-014",
    name: "NEON EARRINGS",
    price: 38000,
    priceUSD: 38,
    aiMatch: 91,
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=600&fit=crop",
    category: { EN: "ACC", KR: "악세서리" },
    tags: ["#Neon", "#Y2K", "#Street"]
  },
  {
    id: "acc-015",
    name: "테크웨어 마스크",
    price: 42000,
    priceUSD: 42,
    aiMatch: 95,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop",
    category: { EN: "ACC", KR: "악세서리" },
    tags: ["#Techwear", "#Cyber", "#Utility"]
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
