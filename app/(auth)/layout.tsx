import AuthHeader from '@/components/header/auth-header'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthHeader />
      <main className='flex flex-col w-full md:max-w-[700px] mx-auto items-center justify-center min-h-[calc(100dvh_-_144px)] my-8'>
        {children}
      </main>
    </>
  )
}
