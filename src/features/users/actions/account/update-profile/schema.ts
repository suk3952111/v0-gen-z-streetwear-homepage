import { z } from "zod"

export const UpdateAccountProfileSchema = z.object({
  full_name: z.string().min(1).max(120),
  phone: z.string().max(40).optional().default(""),
  avatar_url: z
    .string()
    .max(500)
    .optional()
    .default("")
    .refine((value) => value.trim().length === 0 || /^https?:\/\//i.test(value.trim()), {
      message: "Avatar URL must start with http:// or https://",
    }),
})

export type UpdateAccountProfileInput = z.infer<typeof UpdateAccountProfileSchema>

