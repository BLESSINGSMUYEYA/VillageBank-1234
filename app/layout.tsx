import { type Metadata, type Viewport } from 'next'

import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const viewport: Viewport = {
  themeColor: '#0F172A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'uBank - Your Personal & Group Wealth Manager',
  description: 'The modern way to save together. Personal wallets and village banking groups in one app.',
  manifest: '/manifest.json',
}

import { AuthProvider } from '@/components/providers/AuthProvider'
import { LanguageProvider } from '@/components/providers/LanguageProvider'
import { Toaster } from 'sonner'
import { ServiceWorkerRegister } from '@/components/providers/ServiceWorkerRegister'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <LanguageProvider>
            {children}
            <Toaster richColors position="top-center" closeButton />
            <ServiceWorkerRegister />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

