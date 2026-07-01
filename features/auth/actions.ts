import axios from 'axios'
import { env } from '@/lib/config'
import { createClient } from '@/utils/supabase/client'

// login with email and password
export async function logInWithPassword(email: string, password: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  return { data, error }
}

// login with google
export async function logInWithGoogle() {
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${env.NEXT_PUBLIC_HOST}/api/auth/callback`,
    },
  })
  return { error }
}

// sign-up (new user registration)
export async function signUp(username: string, email: string, password: string) {
  const supabase = createClient()
  const {
    data: { isExist },
  }: { data: { isExist: boolean } } = await axios.post(`/api/auth/check-user`, { email })
  if (isExist) {
    return {
      data: null,
      error: { message: 'このメールアドレスはすでに登録されています' },
    }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${env.NEXT_PUBLIC_HOST}/login`,
      data: { display_name: username },
    },
  })

  return { data, error }
}

// reset password
export async function resetPassword(newPassword: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  return { data, error }
}

// forgot password
export async function forgotPassword(email: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${env.NEXT_PUBLIC_HOST}/reset-password`,
  })

  return { data, error }
}