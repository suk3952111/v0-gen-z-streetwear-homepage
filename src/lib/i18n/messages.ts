import type { MessageNode } from "./types"
import { aboutEnMessages } from "@/features/about/messages/en"
import { aboutKrMessages } from "@/features/about/messages/kr"
import { layoutEnMessages } from "@/components/layout/messages/en"
import { layoutKrMessages } from "@/components/layout/messages/kr"
import { adminEnMessages } from "@/features/admin/messages/en"
import { adminKrMessages } from "@/features/admin/messages/kr"
import { cartEnMessages } from "@/features/cart/messages/en"
import { cartKrMessages } from "@/features/cart/messages/kr"
import { productsEnMessages } from "@/features/products/messages/en"
import { productsKrMessages } from "@/features/products/messages/kr"
import { usersEnMessages } from "@/features/users/messages/en"
import { usersKrMessages } from "@/features/users/messages/kr"
import { wishlistEnMessages } from "@/features/wishlist/messages/en"
import { wishlistKrMessages } from "@/features/wishlist/messages/kr"

export const messages: Record<"EN" | "KR", MessageNode> = {
  EN: {
    about: aboutEnMessages,
    layout: layoutEnMessages,
    admin: adminEnMessages,
    cart: cartEnMessages,
    products: productsEnMessages,
    users: usersEnMessages,
    wishlist: wishlistEnMessages,
  },
  KR: {
    about: aboutKrMessages,
    layout: layoutKrMessages,
    admin: adminKrMessages,
    cart: cartKrMessages,
    products: productsKrMessages,
    users: usersKrMessages,
    wishlist: wishlistKrMessages,
  },
}
