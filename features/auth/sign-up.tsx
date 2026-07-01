'use client'

import { useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import Image from 'next/image'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { FcGoogle } from 'react-icons/fc'
import { FiLock, FiMail, FiUser } from 'react-icons/fi'
import { HiMiniArrowRightStartOnRectangle } from 'react-icons/hi2'
import * as yup from 'yup'
import { signUp , logInWithGoogle } from './actions'
import InputField from '@/components/input/input-field'
import RequiredLabel from '@/components/label/required-label'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface ISignUpForm {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
}

export default function SignUpPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const schema = yup.object().shape({
    username: yup.string().trim().required('ユーザー名は必須です').min(2, 'ユーザー名は2文字以上で入力してください').max(50, 'ユーザー名は50文字以内で入力してください'),
    email: yup.string().required('メールアドレスは必須です').email('メールアドレスを正しく入力してください'),
    password: yup.string().required('パスワードは必須です').min(6, 'パスワードは6文字以上で入力してください'),
    confirm_password: yup.string().required('パスワード（確認用）は必須です').oneOf([yup.ref('password')], 'パスワードが一致しません'),
  })

  const { control, handleSubmit, formState: { errors } } = useForm<ISignUpForm>({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data: ISignUpForm) => {
    setErrorMessage('')
    setSuccessMessage('')
    setIsLoading(true)

    try {
      const { email, password, username } = data
      const { error } = await signUp(username, email, password)
      if (error) {
        setErrorMessage(error.message || 'アカウント作成に失敗しました')
        return
      }
      setSuccessMessage('アカウントが作成されました。メールを確認してください')
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message || 'アカウント作成中にエラーが発生しました')
      } else {
        setErrorMessage('アカウント作成中にエラーが発生しました')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Sign up with Google
  const handleGoogleSignUp = async () => {
    setErrorMessage(null)
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
        <h1 className='text-2xl text-gray-900 text-center mt-4 mb-8 font-bold'>サインアップ</h1>

        {/* Google Sign Up Button */}
        <Button
          onClick={handleGoogleSignUp}
          className="w-full flex items-center justify-center space-x-6 border bg-white border-gray-300 rounded shadow-md py-6 px-4 mb-8 hover:bg-gray-50 transition-colors"
        >
          <FcGoogle className="text-2xl" />
          <span className="text-lg text-gray-700">Googleで始める</span>
        </Button>

        {/* Divider */}
        <div className="w-full flex items-center mb-4">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="px-4 lg:px-8  text-sm text-gray-500">またはメールアドレスで始める</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
          <div className='flex flex-col gap-2'>
            <div className='flex gap-1 items-center'>
              <FiUser className='text-lg' />
              <Label htmlFor='username'>ユーザー名</Label>
              <RequiredLabel />
            </div>
            <div className='w-full'>
              <InputField id='username' control={control} className='w-full' />
              {errors.username && (
                <p className='text-xs mt-2 text-m-red'>
                  {errors.username.message}
                </p>
              )}
            </div>
          </div>

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

          <div className='flex flex-col gap-2'>
            <div className='flex gap-1 items-center'>
              <FiLock className='text-lg' />
              <Label htmlFor='confirm_password'>パスワード（確認用）</Label>
              <RequiredLabel />
            </div>
            <div className='w-full'>
              <InputField
                id='confirm_password'
                control={control}
                className='w-full'
                isPassword
              />
              {errors.confirm_password && (
                <p className='text-xs mt-2 text-m-red'>
                  {errors.confirm_password.message}
                </p>
              )}
            </div>
          </div>

          {errorMessage && (
            <p className='w-full mb-4 bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700'>
              {errorMessage}
            </p>
          )}

          {successMessage && (
            <p className='w-full mb-4 bg-green-50 border-l-4 border-green-400 p-4 text-sm text-green-700'>
              {successMessage}
            </p>
          )}

          {/* SignUp Button */}
          <div className='flex items-start'>
            <div className='w-full'>
              <Button
                type='submit'
                disabled={isLoading}
                variant='default'
                className='w-full rounded-none bg-m-blue hover:bg-m-hover-blue transform transition-all duration-300'
              >
                {isLoading ? 'サインアップ中...' : 'サインアップ'}
              </Button>
            </div>
          </div>
        </form>

        <div className='w-full text-center text-sm flex items-center justify-center mt-8'>
          アカウントをお持ちの方は
          <Link href='/login' className='flex items-center font-semibold'>
            <span className='text-m-blue'>こちら</span>
            <HiMiniArrowRightStartOnRectangle className='text-lg' />
          </Link>
        </div>
      </div>
    </div>
  )
}
