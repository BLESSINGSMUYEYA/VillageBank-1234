import { type Metadata } from 'next'
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
} from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import { UserProfile } from '@/components/user-profile'
import { MobileNavigation } from '@/components/layout/MobileNavigation'
import { DesktopNavigation } from '@/components/layout/DesktopNavigation'
import { Footer } from '@/components/layout/Footer'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Village Banking System',
  description: 'Community banking management system for Malawi',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <div className="min-h-screen bg-linear-to-br from-indigo-50/50 via-white to-blue-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* Mobile Navigation */}
            <MobileNavigation />

            {/* Desktop Header */}
            <DesktopNavigation />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:pt-8 pb-16 lg:pb-8 animate-fade-in">
              {children}
            </main>

            {/* Footer */}
            <Footer />
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}
