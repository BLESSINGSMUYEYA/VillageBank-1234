'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShieldAlert, Home } from 'lucide-react'

export default function ForbiddenPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 px-4">
            <Card className="w-full max-w-md border-red-200 dark:border-red-900">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-4">
                            <ShieldAlert className="w-12 h-12 text-red-600 dark:text-red-400" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-red-900 dark:text-red-100">
                        Access Denied
                    </CardTitle>
                    <CardDescription className="text-base mt-2">
                        You don't have permission to access this page
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-lg p-4">
                        <p className="text-sm text-red-800 dark:text-red-200">
                            This page requires special permissions. If you believe you should have access, please contact your administrator.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                        <Link href="/dashboard" className="w-full">
                            <Button className="w-full gap-2">
                                <Home className="w-4 h-4" />
                                Return to Dashboard
                            </Button>
                        </Link>
                        <Link href="/" className="w-full">
                            <Button variant="outline" className="w-full">
                                Go to Home Page
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
