import { z } from "zod"

export const FindStyleByImageSchema = z.object({
  imageDataUrl: z
    .string()
    .min(1)
    .refine(
      (value) =>
        value.startsWith("data:image/jpeg") ||
        value.startsWith("data:image/png") ||
        value.startsWith("data:image/webp"),
      { message: "Invalid image format" },
    ),
  limit: z.number().int().min(1).max(12).optional().default(6),
})

export type FindStyleByImageInput = z.infer<typeof FindStyleByImageSchema>

