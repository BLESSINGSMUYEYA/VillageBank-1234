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
          <div className="min-h-screen bg-gray-50">
            {/* Mobile Navigation */}
            <MobileNavigation />
            
            {/* Desktop Header */}
            <header className="hidden lg:flex justify-end items-center p-4 gap-4 h-16 bg-white border-b">
              <SignedOut>
                <SignInButton />
                <SignUpButton>
                  <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                    Sign Up
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserProfile />
              </SignedIn>
            </header>
            
            {/* Main Content */}
            <main className="lg:pt-0 pb-16 lg:pb-0">
              {children}
            </main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}
