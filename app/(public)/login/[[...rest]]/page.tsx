'use client'

import { SignIn } from '@clerk/nextjs'

export default function SignInCatchAllPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="w-full max-w-[95%] sm:max-w-md">
                <div className="text-center mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
                        Welcome Back
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600">
                        Sign in to access your village banking account
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6">
                    <SignIn
                        path="/login"
                        routing="path"
                        signUpUrl="/register"
                        redirectUrl="/dashboard"
                        appearance={{
                            elements: {
                                rootBox: "w-full",
                                card: "shadow-none",
                                formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-sm sm:text-base py-2 sm:py-3",
                                formFieldInput: "text-sm sm:text-base py-2 sm:py-3",
                                footerActionLink: "text-blue-600 hover:text-blue-700",
                                identityPreviewText: "text-sm sm:text-base",
                                formFieldLabel: "text-sm sm:text-base",
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
