'use client'

import { useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { FiMail } from 'react-icons/fi'
import { HiMiniArrowRightStartOnRectangle } from 'react-icons/hi2'
import * as yup from 'yup'
import InputField from '@/components/input/input-field'
import RequiredLabel from '@/components/label/required-label'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface IForgotPasswordForm {
  email: string;
}

export default function ForgotPasswordPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | React.ReactElement | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const schema = yup.object().shape({
    email: yup
      .string().required('メールアドレスは必須です')
      .email('メールアドレスを正しく入力してください'),
  })

  const { control, handleSubmit, formState: { errors } } = useForm<IForgotPasswordForm>({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data: IForgotPasswordForm) => {
    setErrorMessage(null)
    setSuccessMessage(null)
    setIsLoading(true)
    const { email } = data

    try {
      await axios.post('/api/auth/forgot-password', { email })
      setSuccessMessage('正常に送信が完了いたしました。メールを確認してパスワードをリセットしてください')
    } catch (error) {
      const message = axios.isAxiosError<{ error?: string }>(error)
        ? error.response?.data?.error
        : undefined
      setErrorMessage(message || '送信中にエラーが発生しました')
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
        <h1 className='text-2xl text-gray-900 text-center mt-4 font-bold'>パスワード再設定</h1>
        <p className='mx-2 text-sm text-center mt-2 mb-8'>パスワード再設定のご案内をお送りいたします<br />ご登録のメールアドレスを入力してください</p>

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

          {errorMessage && (
            <p className='text-xs text-m-red'>{errorMessage}</p>
          )}

          {successMessage && (
            <p className='w-full mb-4 bg-green-50 border-l-4 border-green-400 p-3 text-sm text-green-700'>
              {successMessage}
            </p>
          )}

          {/* Reset Button */}
          <div className='flex items-start'>
            <div className='w-full'>
              <Button
                type='submit'
                disabled={isLoading}
                variant='default'
                className='w-full rounded-none bg-m-blue hover:bg-m-hover-blue transform transition-all duration-300'
              >
                { isLoading ? '送信中...' : '送信する' }
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