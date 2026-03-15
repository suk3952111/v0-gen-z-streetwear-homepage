import type { AccountProfile } from "@/features/users/types/account"

export type UpdateAccountProfileActionState = {
  success: boolean
  data: AccountProfile | null
  errorMessage?: string
}

