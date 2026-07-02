import '@/styles/globals.scss'
import { StrictMode } from 'react'
import HolyLoader from 'holy-loader'
import { type Metadata, type Viewport } from 'next'
import Providers from '@/app/providers'
import ScrollTopButton from '@/components/scroll-top-button'
import TailwindIndicator from '@/components/tailwind-indicator'
import { notoSansJP } from '@/lib/fonts'
import { type AuthState } from '@/providers/auth-provider'
import { getUser } from '@/utils/supabase/user'

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#030712' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
  colorScheme: 'dark light',
  width: 'device-width',
  initialScale: 1.0,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'わたしの政治',
  applicationName: 'わたしの政治',
  description: '政治は、わたしの"推し"から始まる',
  openGraph: {
    title: 'わたしの政治',
    siteName: 'わたしの政治',
    description: '政治は、わたしの"推し"から始まる',
    type: 'website',
    images: ['/images/logo.png'],
  },
  icons: [
    {
      rel: 'icon',
      url: '/favicon-16x16.png',
      sizes: '16x16',
      type: 'image/png',
    },
    {
      rel: 'icon',
      url: '/favicon-32x32.png',
      sizes: '32x32',
      type: 'image/png',
    },
    {
      url: '/android-chrome-192x192.png',
      sizes: '192x192',
      type: 'image/png',
    },
    {
      url: '/android-chrome-512x512.png',
      sizes: '512x512',
      type: 'image/png',
    },
  ],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser()
  const initialAuthState: AuthState = {
    user_id: user?.id ?? '',
    user_email: user?.email ?? '',
    user_name: (user?.user_metadata.display_name as string) ?? '',
  }

  return (
    <StrictMode>
      <html lang='jp' suppressHydrationWarning>
      <body className={notoSansJP.className}>
        <HolyLoader color="#006BFF" height="1px" easing="linear" />
        <Providers initialAuthState={initialAuthState}>
          <div className='flex flex-col w-full min-h-screen overflow-x-hidden overflow-y-auto'>
            {children}
            <ScrollTopButton />
          </div>
          <TailwindIndicator />
        </Providers>        
      </body>
    </html>
    </StrictMode>
  )
}