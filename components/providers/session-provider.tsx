'use client'

// This file is deprecated - Clerk handles authentication automatically
// Remove this file after confirming all NextAuth usage is replaced

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
