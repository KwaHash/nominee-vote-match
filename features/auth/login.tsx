'use client'

import { useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { AiOutlineQuestionCircle } from 'react-icons/ai'
import { FcGoogle } from 'react-icons/fc'
import { FiLock, FiMail } from 'react-icons/fi'
import { HiMiniArrowRightStartOnRectangle } from 'react-icons/hi2'
import * as yup from 'yup'
import { logInWithGoogle, logInWithPassword } from './actions'
import InputField from '@/components/input/input-field'
import RequiredLabel from '@/components/label/required-label'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { type AuthState } from '@/providers/auth-provider'
import { useAuth } from '@/providers/auth-provider'

interface ILogInForm {
  email: string;
  password: string;
}

export default function LogInPage() {
  const router = useRouter()
  const { updateAuthState } = useAuth()
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const schema = yup.object().shape({
    email: yup
      .string().required('メールアドレスは必須です')
      .email('メールアドレスを正しく入力してください'),
    password: yup.string().required('パスワードは必須です'),
  })

  const { control, handleSubmit, formState: { errors }} = useForm<ILogInForm>({
    resolver: yupResolver(schema),
  })

  // Log in with email and password
  const onSubmit = async (data: ILogInForm) => {
    setErrorMessage('')
    setIsLoading(true)

    try {
      const { email, password } = data
      const { error } = await logInWithPassword(email, password)
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrorMessage('メールアドレスまたはパスワードが正しくありません')
        } else if (error.message.includes('Email not confirmed')) {
          setErrorMessage('メールアドレスが確認されていません。メールを確認してください。')
        } else {
          setErrorMessage(error.message || 'ログインに失敗しました')
        }
        return
      }
      const { data: { user } } = await axios.get<{ user: AuthState }>('/api/user')
      updateAuthState({ ...user })
      router.refresh()
      router.push('/')
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message || 'ログイン中にエラーが発生しました')
      } else {
        setErrorMessage('ログイン中にエラーが発生しました')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Login with Google
  const handleGoogleSignIn = async () => {
    setErrorMessage('')
    setIsLoading(true)

    try {
      const { error } = await logInWithGoogle()

      if (error) {
        setErrorMessage(error.message || 'Googleサインアップに失敗しました')
        return
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message || 'サインアップ中にエラーが発生しました')
      } else {
        setErrorMessage('サインアップ中にエラーが発生しました')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='w-full max-w-[500px] m-auto'>
      <div className='bg-white w-full px-8 py-10 rounded-lg'>
        <figure className='flex justify-center mb-2'>
          <Image src='/images/logo.png' width={142} height={78} alt='わたしの政治ロゴ' />
        </figure>
        <h1 className='text-2xl text-gray-900 text-center mt-4 mb-8 font-bold'>ログイン</h1>

        {/* Google Login Button */}
        <Button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center space-x-6 border bg-white border-gray-300 rounded shadow-md p-5 mb-8 hover:bg-gray-50 transform transition-all duration-300"
        >
          <FcGoogle className="text-2xl" />
          <span className="text-lg text-gray-700">Googleでログイン</span>
        </Button>

        {/* Divider */}
        <div className="w-full flex items-center mb-6">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="px-4 lg:px-8  text-sm text-gray-500">またはメールアドレスで続ける</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
          <div className='flex flex-col gap-2'>
            <div className='flex gap-1 items-center'>
              <FiMail className='text-lg' />
              <Label htmlFor='email'>メールアドレス</Label>
              <RequiredLabel />
            </div>
            <div className='w-full'>
              <InputField id='email' control={control} className='w-full' />
              {errors.email && (
                <p className='text-xs mt-2 text-m-red'>
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          <div className='flex flex-col gap-2'>
            <div className='flex gap-1 items-center'>
              <FiLock className='text-lg' />
              <Label htmlFor='password'>パスワード</Label>
              <RequiredLabel />
            </div>
            <div className='w-full'>
              <InputField
                id='password'
                control={control}
                className='w-full'
                isPassword
              />
              {errors.password && (
                <p className='text-xs mt-2 text-m-red'>
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          {errorMessage && (
            <p className='text-xs text-m-red'>{errorMessage}</p>
          )}

          {/* Login Button */}
          <div className='flex items-start'>
            <div className='w-full'>
              <Button
                type='submit'
                disabled={isLoading}
                variant='default'
                className='w-full rounded-none bg-m-blue hover:bg-m-hover-blue transform transition-all duration-300'
              >
                {isLoading ? 'ログイン中...' : 'ログイン'}
              </Button>
            </div>
          </div>
        </form>

        <div className='w-full flex justify-center items-center mt-8'>
          <Link href='/forgot-password' className='text-sm flex items-center hover:text-m-blue transform transition-all duration-300'>
            <AiOutlineQuestionCircle className='text-lg mr-2' />
            <span>パスワードをお忘れですか？</span>
          </Link>
        </div>

        <div className='w-full text-center text-sm flex items-center justify-center mt-3'>
          アカウントをお持ちでない方は
          <Link href='/sign-up' className='flex items-center font-semibold'>
            <span className='text-m-blue'>こちら</span>
            <HiMiniArrowRightStartOnRectangle className='text-lg' />
          </Link>
        </div>
      </div>
    </div>
  )
}
