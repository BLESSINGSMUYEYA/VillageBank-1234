import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { VerificationsList } from '@/components/admin/verifications/VerificationsList'
import { PageHeader } from '@/components/layout/PageHeader'
import { ShieldCheck } from 'lucide-react'

export default async function AdminVerificationsPage() {
    const session = await getSession()
    if (!session?.userId) redirect('/login')

    const admin = await prisma.user.findUnique({
        where: { id: session.userId }
    })

    if (!admin || (admin.role !== 'SUPER_ADMIN' && admin.role !== 'REGIONAL_ADMIN')) {
        redirect('/dashboard')
    }

    // Build Query based on Role
    let whereClause: any = {
        status: 'PENDING'
    }

    if (admin.role === 'REGIONAL_ADMIN') {
        if (!admin.region) {
            // Edge case: Regional Admin without a region set?
            return <div>Error: Your account has no region assigned.</div>
        }
        whereClause.user = {
            region: admin.region
        }
    }

    const pendingVerifications = await prisma.identityVerification.findMany({
        where: whereClause,
        include: {
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phoneNumber: true,
                    region: true,
                    role: true
                }
            }
        },
        orderBy: {
            submittedAt: 'asc'
        }
    })

    return (
        <div className="space-y-6">
            <PageHeader
                title="Identity Verification"
                description={
                    <span className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-blue-500" />
                        Review pending KYC documents from {admin.role === 'REGIONAL_ADMIN' ? `${admin.region} Region` : 'all regions'}.
                    </span>
                }
            />

            <VerificationsList verifications={pendingVerifications} />
        </div>
    )
}
