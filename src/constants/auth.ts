export const AUTH_REQUIRED_PREFIXES = ["/account", "/admin"] as const
export const ADMIN_REQUIRED_PREFIXES = ["/admin"] as const

export const USER_ROLES = {
  platformAdmin: "platform_admin",
  seller: "seller",
  customer: "customer",
} as const
