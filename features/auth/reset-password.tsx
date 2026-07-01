'use client'

import { useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import Image from 'next/image'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { FiLock } from 'react-icons/fi'
import { HiMiniArrowRightStartOnRectangle } from 'react-icons/hi2'
import * as yup from 'yup'
import { resetPassword } from './actions'
import InputField from '@/components/input/input-field'
import RequiredLabel from '@/components/label/required-label'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface IResetPasswordForm {
  password: string;
  confirm_password: string;
}

const ResetPasswordPage = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | React.ReactElement | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const schema = yup.object().shape({
    password: yup.string().required('パスワードは必須です').min(6, 'パスワードは6文字以上で入力してください'),
    confirm_password: yup
      .string().required('パスワード（確認用）は必須です')
      .oneOf([yup.ref('password')], 'パスワードが一致しません'),
  })

  const { control, handleSubmit, formState: { errors } } = useForm<IResetPasswordForm>({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data: IResetPasswordForm) => {
    setErrorMessage(null)
    setSuccessMessage(null)
    setIsLoading(true)

    try {
      const { password } = data
      const { error } = await resetPassword(password)
      if (error) {
        setErrorMessage(error.message || 'パスワード再設定に失敗しました')
        return
      }

      setSuccessMessage(
        <div className="flex flex-col items-center space-y-2">
          <span>変更は正常に反映されました。</span>
          <Link
            href='/login'
            className="text-primary-light font-semibold hover:underline flex items-center space-x-1"
          >
            <span>ログインページへ</span>
            <HiMiniArrowRightStartOnRectangle className="text-lg" />
          </Link>
        </div>,
      )
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message || 'パスワード再設定に失敗しました')
      } else {
        setErrorMessage('パスワード再設定に失敗しました')
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
        <h1 className='text-2xl text-gray-900 text-center mt-4 mb-8 font-bold'>パスワード再設定</h1>

        {/* Divider */}
        <div className="w-full flex items-center mb-4">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="px-4 lg:px-8  text-sm text-gray-500">ごパスワードを入力してください</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {errorMessage ? (
          <div className="w-full mb-4 bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : successMessage ? (
          <div className="w-full mb-4 bg-green-50 border-l-4 border-green-400 p-4 text-sm text-green-700">
            {successMessage}
          </div>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
        <div className='flex flex-col gap-2'>
            <div className='flex gap-1 items-center'>
              <FiLock className='text-lg' />
              <Label htmlFor='password'>新しいパスワード</Label>
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
              <Label htmlFor='confirm_password'>パスワードの確認</Label>
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

          {/* Change Button */}
          <div className='flex items-start'>
            <div className='w-full'>
              <Button
                type='submit'
                disabled={isLoading}
                variant='default'
                className='w-full rounded-none bg-m-blue hover:bg-m-hover-blue transform transition-all duration-300'
              >
                { isLoading? '設定中...' : '設定する'}
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

export default ResetPasswordPage