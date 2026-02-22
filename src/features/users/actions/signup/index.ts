'use server'

import { redirect } from 'next/navigation'

import { APP_URLS } from '@/constants/url'
import { createSupabaseServer } from '@/lib/supabase/server'
import { SignupSchema } from './schema'
import type { SignupActionState } from './types'

export async function signupAction(
  prevState: SignupActionState | null,
  formData: FormData,
): Promise<SignupActionState> {
  const rawData = {
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    passwordConfirm: formData.get('passwordConfirm'),
  }

  const validatedFields = SignupSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      success: false,
      errorKey: 'validation_input',
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { name, email, password } = validatedFields.data

  try {
    const supabase = await createSupabaseServer()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    })

    if (error) {
      const errorMessage = error.message.toLowerCase()

      if (errorMessage.includes('already registered') || errorMessage.includes('already exists')) {
        return {
          success: false,
          errorKey: 'email_in_use_or_social',
        }
      }

      if (errorMessage.includes('password')) {
        return {
          success: false,
          errorKey: 'weak_password',
        }
      }

      if (errorMessage.includes('signup is disabled')) {
        return {
          success: false,
          errorKey: 'signup_disabled',
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
        errorKey: 'signup_failed',
      }
    }

    if (!data.user) {
      return {
        success: false,
        errorKey: 'signup_failed',
      }
    }

    return {
      success: true,
      message: data.session ? 'Sign up completed successfully' : 'Check your email to verify your account',
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

export async function signupAndRedirectAction(
  prevState: SignupActionState | null,
  formData: FormData,
): Promise<SignupActionState> {
  const result = await signupAction(prevState, formData)

  if (result.success) {
    redirect(APP_URLS.home)
  }

  return result
}
