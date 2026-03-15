import type { AccountAddress } from "@/features/users/types/account"

export type SaveAccountAddressActionState = {
  success: boolean
  data: AccountAddress[]
  errorMessage?: string
}

