import { z } from "zod"

export const LoadShopProductsSchema = z.object({
  searchQuery: z.string().optional().default(""),
  categorySlug: z.string().optional().default("all"),
  brandSlug: z.string().optional().default("all"),
  tagSlugs: z.array(z.string()).optional().default([]),
  offset: z.number().int().min(0).optional().default(0),
  limit: z.number().int().min(1).max(40).optional().default(16),
})

export type LoadShopProductsInput = z.infer<typeof LoadShopProductsSchema>
