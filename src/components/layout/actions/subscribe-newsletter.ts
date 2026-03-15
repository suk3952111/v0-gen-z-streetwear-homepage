"use server"

import { z } from "zod"
import { createSupabaseServer } from "@/lib/supabase/server"

const SubscribeNewsletterSchema = z.object({
  email: z.string().email().max(255),
})

export type SubscribeNewsletterActionState = {
  success: boolean
  errorMessage?: string
}

export async function subscribeNewsletterAction(
  email: string,
): Promise<SubscribeNewsletterActionState> {
  const parsed = SubscribeNewsletterSchema.safeParse({ email: email.trim().toLowerCase() })
  if (!parsed.success) {
    return {
      success: false,
      errorMessage: "Invalid email",
    }
  }

  try {
    const supabase = await createSupabaseServer()
    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert(
        {
          email: parsed.data.email,
          source: "footer",
        },
        { onConflict: "email", ignoreDuplicates: false },
      )

    if (error) throw new Error(error.message)
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to subscribe"
    return {
      success: false,
      errorMessage: message,
    }
  }
}
