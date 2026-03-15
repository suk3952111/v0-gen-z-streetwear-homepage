import type { AccountAddress } from "@/features/users/types/account"

export type SetDefaultAccountAddressActionState = {
  success: boolean
  data: AccountAddress[]
  errorMessage?: string
}

