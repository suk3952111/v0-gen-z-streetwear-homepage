import { z } from "zod"

export const SaveAccountAddressSchema = z.object({
  id: z.string().min(1).optional(),
  recipient_name: z.string().min(1).max(120),
  phone: z.string().min(1).max(40),
  address_line1: z.string().min(1).max(300),
  address_line2: z.string().max(300).optional().default(""),
  city: z.string().min(1).max(120),
  postal_code: z.string().min(1).max(40),
})

export type SaveAccountAddressInput = z.infer<typeof SaveAccountAddressSchema>

