'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Custom404() {
  return (
    <div className='px-4 py-16 md:py-24 lg:py-32'>
      <div className='w-full mx-auto flex flex-col gap-y-8 items-center text-center'>
        <h2 className='flex flex-col gap-y-4 items-center justify-center'>
          <span className='font-bold text-7xl md:text-8xl'>404</span>
          <span className='font-bold text-3xl md:text-4xl'>ページが見つかりません</span>
        </h2>
        <div className='mx-auto'>
          <p className='font-bold text-lg mb-2'>
            お探しのページへたどり着く事ができませんでした。
          </p>
          <p className='font-medium'>引き続き問題が発生する場合は、サポートまでご連絡ください。</p>
        </div>
        <Link href='/' passHref>
          <Button
            variant='outline'
            className='shadow rounded-none px-8 py-6 text-lg hover:bg-gray-100 hover:text-black transition-all duration-300'
          >
            トップページへ
          </Button>
        </Link>
      </div>
    </div>
  )
}
