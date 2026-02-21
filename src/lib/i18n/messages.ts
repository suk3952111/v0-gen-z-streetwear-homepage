import type { MessageNode } from "./types"
import { layoutEnMessages } from "@/components/layout/messages/en"
import { layoutKrMessages } from "@/components/layout/messages/kr"
import { productsEnMessages } from "@/features/products/messages/en"
import { productsKrMessages } from "@/features/products/messages/kr"
import { usersEnMessages } from "@/features/users/messages/en"
import { usersKrMessages } from "@/features/users/messages/kr"

export const messages: Record<"EN" | "KR", MessageNode> = {
  EN: {
    layout: layoutEnMessages,
    products: productsEnMessages,
    users: usersEnMessages,
  },
  KR: {
    layout: layoutKrMessages,
    products: productsKrMessages,
    users: usersKrMessages,
  },
}

