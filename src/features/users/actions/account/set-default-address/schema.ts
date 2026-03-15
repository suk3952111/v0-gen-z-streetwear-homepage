import { z } from "zod"

export const SetDefaultAccountAddressSchema = z.object({
  id: z.string().min(1),
})

export type SetDefaultAccountAddressInput = z.infer<typeof SetDefaultAccountAddressSchema>

