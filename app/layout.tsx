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
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  if ('serviceWorker' in navigator) {
                    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                    console.log('SW Setup - Env:', '${process.env.NODE_ENV}', 'Local:', isLocal);
                    
                    if ('${process.env.NODE_ENV}' === 'production' && !isLocal) {
                      window.addEventListener('load', function() {
                        navigator.serviceWorker.register('/sw.js').then(function(registration) {
                          console.log('ServiceWorker registration successful with scope: ', registration.scope);
                        }, function(err) {
                          console.log('ServiceWorker registration failed: ', err);
                        });
                      });
                    } else {
                      // Unregister service workers in development or localhost
                      navigator.serviceWorker.getRegistrations().then(function(registrations) {
                        for(let registration of registrations) {
                          registration.unregister();
                          console.log('ServiceWorker unregistered (Dev/Localhost)');
                        }
                      });
                    }
                  }
                `,
              }}
            />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
