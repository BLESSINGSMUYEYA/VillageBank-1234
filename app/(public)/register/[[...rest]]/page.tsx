'use client'

import { SignUp } from '@clerk/nextjs'

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-indigo-100 px-4 py-8 sm:py-12 md:py-16 lg:py-20">
            <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
                <div className="text-center mb-6 sm:mb-8 md:mb-10">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4 leading-tight">
                        Join Village Banking
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-md mx-auto px-2">
                        Create your account to start managing your community finances
                    </p>
                </div>
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl p-4 sm:p-6 md:p-8 lg:p-10">
                    <SignUp
                        path="/register"
                        routing="path"
                        signInUrl="/login"
                        redirectUrl="/dashboard"
                        appearance={{
                            elements: {
                                rootBox: "w-full",
                                card: "shadow-none border-0",
                                formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-sm sm:text-base py-2.5 sm:py-3 md:py-3.5 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-all duration-200 font-semibold",
                                formFieldInput: "text-sm sm:text-base py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200",
                                footerActionLink: "text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base transition-colors duration-200",
                                identityPreviewText: "text-sm sm:text-base font-medium",
                                formFieldLabel: "text-sm sm:text-base font-semibold text-gray-700 mb-1.5 sm:mb-2",
                                socialButtonsBlockButton: "h-10 sm:h-11 md:h-12 rounded-lg sm:rounded-xl transition-all duration-200",
                                socialButtonsBlockButtonText: "text-sm sm:text-base font-medium",
                                dividerText: "text-xs sm:text-sm text-gray-500 font-medium",
                                headerTitle: "text-xl sm:text-2xl font-bold text-gray-900",
                                headerSubtitle: "text-sm sm:text-base text-gray-600 mt-2",
                                formField: "mb-4 sm:mb-5",
                                form: "space-y-4 sm:space-y-5",
                                footer: "mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100",
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
