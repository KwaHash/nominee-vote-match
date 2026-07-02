import { type ReactNode } from 'react'

interface MainHeroProps {
  title: string
  description: ReactNode
}

const MainHero = ({ title, description }: MainHeroProps) => {
  return (
    <section className='relative bg-white'>
      <div className='absolute inset-0 bg-gradient-to-r from-green-600 to-green-600/85' />
      <div className='relative max-w-7xl mx-auto px-4 py-24'>
        <div className='text-center'>
          <h1 className='text-4xl sm:text-5xl lg:text-6xl font-bold leading-normal tracking-tight text-white'>{title}</h1>
          <p className='mt-6 text-base sm:text-lg md:text-xl !leading-6 sm:!leading-8 text-gray-100'>
            {description}
          </p>
        </div>
      </div>
      <div className='absolute bottom-0 left-0 right-0'>
        <svg
          className='w-full h-16 text-white transform rotate-180'
          fill='currentColor'
          viewBox='0 0 1200 120'
          preserveAspectRatio='none'
        >
          <path d='M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z' />
        </svg>
      </div>
    </section>
  )
}

export default MainHero