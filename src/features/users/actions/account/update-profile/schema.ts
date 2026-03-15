import { z } from "zod"

export const UpdateAccountProfileSchema = z.object({
  full_name: z.string().min(1).max(120),
  phone: z.string().max(40).optional().default(""),
})

export type UpdateAccountProfileInput = z.infer<typeof UpdateAccountProfileSchema>

