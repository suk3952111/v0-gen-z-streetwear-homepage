'use server'

import { createSupabaseServer } from '@/lib/supabase/server'
import { LoginSchema } from './schema'
import type { LoginActionState } from './types'

export async function loginAction(
  prevState: LoginActionState | null,
  formData: FormData,
): Promise<LoginActionState> {
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const validatedFields = LoginSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      success: false,
      errorKey: 'validation_input',
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password } = validatedFields.data

  try {
    const supabase = await createSupabaseServer()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      const errorMessage = error.message.toLowerCase()

      if (errorMessage.includes('invalid login credentials') || errorMessage.includes('invalid credentials')) {
        return {
          success: false,
          errorKey: 'invalid_credentials',
        }
      }

      if (errorMessage.includes('email not confirmed')) {
        return {
          success: false,
          errorKey: 'email_not_confirmed',
        }
      }

      if (errorMessage.includes('too many requests') || errorMessage.includes('rate limit')) {
        return {
          success: false,
          errorKey: 'rate_limited',
        }
      }

      if (errorMessage.includes('network')) {
        return {
          success: false,
          errorKey: 'network',
        }
      }

      return {
        success: false,
        errorKey: 'login_failed',
      }
    }

    if (!data.user) {
      return {
        success: false,
        errorKey: 'login_failed',
      }
    }

    return {
      success: true,
      message: 'Logged in successfully',
      data: {
        user: data.user,
        session: data.session,
      },
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error
    }

    return {
      success: false,
      errorKey: 'unexpected',
    }
  }
}
