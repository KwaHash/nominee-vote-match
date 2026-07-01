'use server'

import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { env } from '@/lib/config'
import { type AuthState } from '@/providers/auth-provider'
import { createClient } from '@/utils/supabase/server'

// service-role client for privileged lookups (never exposed to the browser)
const supabaseAdmin = createAdminClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
)

interface LoginResult {
  user: AuthState | null
  error: string | null
}

// login with email and password (sets session cookies atomically)
export async function logInWithPassword(
  email: string,
  password: string
): Promise<LoginResult> {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.user) {
    return { user: null, error: error?.message ?? 'ログインに失敗しました' }
  }

  const { user } = data
  return {
    user: {
      user_id: user.id,
      user_name: (user.user_metadata.display_name as string) ?? '',
      user_email: user.email ?? '',
    },
    error: null,
  }
}

// login with google (initiates the OAuth redirect server-side)
export async function logInWithGoogle(): Promise<{ error: string }> {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${env.NEXT_PUBLIC_HOST}/api/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  // redirect() throws internally to send the browser to the provider URL
  redirect(data.url)
}

// sign-up (new user registration)
export async function signUp(
  username: string,
  email: string,
  password: string
): Promise<{ error: string | null }> {
  // reject emails that already exist as a password account
  const { data: list } = await supabaseAdmin.auth.admin.listUsers()
  const existing = list.users.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  )
  const isExist =
    existing &&
    !existing.identities?.every((identity) => identity.provider !== 'email')
  if (isExist) {
    return { error: 'このメールアドレスはすでに登録されています' }
  }

  const supabase = createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${env.NEXT_PUBLIC_HOST}/login`,
      data: { display_name: username },
    },
  })

  return { error: error?.message ?? null }
}

// reset password (uses the recovery session established from the email link)
export async function resetPassword(
  newPassword: string
): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  return { error: error?.message ?? null }
}

// forgot password (sends the reset email)
export async function forgotPassword(
  email: string
): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${env.NEXT_PUBLIC_HOST}/reset-password`,
  })

  return { error: error?.message ?? null }
}
