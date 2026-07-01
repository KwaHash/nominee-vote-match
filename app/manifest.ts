import  { type MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    // Identity
    id: '/',
    name: 'わたしの政治',
    short_name: 'わたしの政治',
    description: '政治は、わたしの"推し"から始まる',

    // Localization
    lang: 'ja',
    dir: 'ltr',

    // Launch behavior
    start_url: '/',
    scope: '/',
    display: 'fullscreen',
    orientation: 'portrait',

    // Theming
    background_color: '#030712',
    theme_color: '#030712',

    // Store / discovery metadata
    categories: ['politics', 'social', 'news'],

    icons: [
      {
        src: '/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/favicon.ico',
        sizes: '48x48',
        type: 'image/x-icon',
        purpose: 'any',
      },
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      // Maskable variant lets Android crop the icon into any shape
      // without clipping content. Add these assets to /public.
      {
        src: '/android-chrome-maskable-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/android-chrome-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
