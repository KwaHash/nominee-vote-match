import MainHeader from '@/components/header/main-header'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MainHeader />
      <main className='flex flex-col w-full grow bg-[#eee] pt-24'>
        {children}
      </main>
    </>
  )
}
