import type { AccountAddress } from "@/features/users/types/account"

export type DeleteAccountAddressActionState = {
  success: boolean
  data: AccountAddress[]
  errorMessage?: string
}

