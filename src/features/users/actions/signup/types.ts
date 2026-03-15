import type { Session, User } from '@supabase/supabase-js'

export type SignupActionState =
  | {
      success: true
      message?: string
      data: {
        user: User
        session: Session | null
      }
    }
  | {
      success: false
      message?: string
      errorKey?: string
      errors?: Record<string, string[]>
    }
