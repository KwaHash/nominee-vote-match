'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IoArrowForward } from 'react-icons/io5'
import { RiUserAddLine } from 'react-icons/ri'

const AuthHeader = () => {
  const pathName = usePathname()

  return (
    <header className='w-full bg-white shadow'>
      <div className='flex items-center justify-between mx-auto max-w-screen-2xl px-8 py-2'>
        <Link href='/'>
          <Image src='/images/logo.png' alt='わたしの政治ロゴ' width={128} height={64} priority className='w-32 h-16' />
        </Link>
        <div className="flex flex-col sm:flex-row gap-4">
          {pathName === '/login' ? (
            <Link href="/sign-up"
              className="w-full sm:w-auto flex items-center justify-center group rounded-md space-x-1 border-solid border-[1px] border-gray-300 px-3 py-2 text-m-blue hover:bg-m-blue hover:text-white hover:border-m-blue transition-colors duration-300"
            >
              <RiUserAddLine className="text-xl group-hover:text-white transition-colors" />
              <span className="text-sm font-semibold">サインアップ</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="w-full sm:w-auto flex items-center justify-center group rounded-md space-x-1 border-solid border-[1px] border-gray-300 px-3 py-2 text-m-blue hover:bg-m-blue hover:text-white hover:border-m-blue transition-colors duration-300"
            >
              <span className="text-sm font-semibold">ログイン</span>
              <IoArrowForward className="text-primary-light text-xl group-hover:text-white transition-colors" />
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default AuthHeader