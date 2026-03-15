import type { AccountOverview } from "@/features/users/types/account"

export type LoadAccountOverviewActionState = {
  success: boolean
  data: AccountOverview | null
  errorMessage?: string
}

