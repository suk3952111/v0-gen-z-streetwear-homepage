export const adminKrMessages = {
  title: "관리자 패널",
  tabs: {
    dashboard: "대시보드",
    products: "상품 관리",
    orders: "주문 관리",
    inventory: "재고 관리",
    activity: "활동 로그",
  },
  stats: {
    sales: "총 매출",
    orders: "총 주문",
    pending: "대기 주문",
    lowStock: "재고 부족",
  },
  orderTable: {
    title: "주문 관리",
    orderNumber: "주문번호",
    customer: "고객",
    status: "상태",
    total: "금액",
  },
  statuses: {
    pending: "대기",
    confirmed: "확인",
    shipped: "배송중",
    delivered: "배송완료",
    cancelled: "취소",
  },
  refresh: "새로고침",
} as const
