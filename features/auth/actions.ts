'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { env } from '@/lib/config'
import { createSupabaseServerClient } from '@/utils/supabase/server'

// login with google
export async function logInWithGoogle() {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${env.NEXT_PUBLIC_HOST}/api/auth/callback`,
    },
  })

  if (error || !data.url) {
    return { error: error?.message ?? 'Googleログインに失敗しました' }
  }

  redirect(data.url)
}

// login with email and password
export async function logInWithPassword(email: string, password: string) {
  const supabase = createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

// sign-up (new user registration)
export async function signUp(username: string, email: string, password: string) {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${env.NEXT_PUBLIC_HOST}/login`,
      data: {
        display_name: username,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user && data.user.identities?.length === 0) {
    return { error: 'このメールアドレスはすでに登録されています' }
  }

  return { error: null }
}

// reset password (uses the recovery session established from the email link)
export async function resetPassword(newPassword: string) {
  const supabase = createSupabaseServerClient()
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  return { error: error?.message ?? null }
}

// forgot password (sends the reset email)
export async function forgotPassword(email: string) {
  const supabase = createSupabaseServerClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${env.NEXT_PUBLIC_HOST}/api/auth/callback?next=/reset-password`,
  })

  return { error: error?.message ?? null }
}
