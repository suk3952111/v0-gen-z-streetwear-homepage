import React from "react"
import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { LanguageProvider } from '@/components/providers/language-provider'
import { WishlistProvider } from '@/components/providers/wishlist-provider'
import { CartProvider } from '@/components/providers/cart-provider'
import './globals.css'
import { AppShell } from '@/components/layout/app-shell'

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'VIBE CHECK | Gen-Z Streetwear',
  description: 'AI-powered streetwear drops that match your vibe. No cap.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <LanguageProvider>
          <WishlistProvider>
            <CartProvider>
              <AppShell>{children}</AppShell>
            </CartProvider>
          </WishlistProvider>
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  )
}

