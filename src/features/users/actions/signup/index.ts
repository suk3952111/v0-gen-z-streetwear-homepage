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
      message: 'Please check your input values',
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
          message: 'This email is already registered',
        }
      }

      if (errorMessage.includes('network')) {
        return {
          success: false,
          message: 'Network error occurred. Please try again',
        }
      }

      return {
        success: false,
        message: 'Failed to sign up. Please try again',
      }
    }

    if (!data.user) {
      return {
        success: false,
        message: 'Failed to sign up. User was not created',
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
      message: 'Unexpected error occurred',
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
