import { z } from "zod"

export const LoadAdminDashboardSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  pageSize: z.number().int().min(1).max(50).optional().default(10),
})

export type LoadAdminDashboardInput = z.infer<typeof LoadAdminDashboardSchema>

