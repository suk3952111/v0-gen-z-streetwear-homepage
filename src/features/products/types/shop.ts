export type ShopFilterOption = {
  value: string
  label: string
}

export type ShopProductItem = {
  id: string
  name: string
  priceKRW: number
  priceUSD: number
  aiMatch: number
  image: string
  category: {
    EN: string
    KR: string
  }
  tags: string[]
}

export type ShopProductsPage = {
  items: ShopProductItem[]
  nextOffset: number
  hasMore: boolean
}

export type ShopInitialPayload = {
  categories: ShopFilterOption[]
  tags: ShopFilterOption[]
  page: ShopProductsPage
}
