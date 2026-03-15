import { z } from "zod"

export const CreateCheckoutOrderSchema = z.object({})

export type CreateCheckoutOrderInput = z.infer<typeof CreateCheckoutOrderSchema>

