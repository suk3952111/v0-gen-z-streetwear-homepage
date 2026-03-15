import { z } from "zod"

export const DeleteAccountAddressSchema = z.object({
  id: z.string().min(1),
})

export type DeleteAccountAddressInput = z.infer<typeof DeleteAccountAddressSchema>

