
'use client'
import { useState } from 'react'

import { motion } from 'framer-motion'
import { staggerContainer } from '@/lib/motions'
import { SecurityVerificationModal } from './SecurityVerificationModal'
import { DashboardHero } from '@/components/dashboard/DashboardHero'
import { FinancialOverview } from '@/components/dashboard/FinancialOverview'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { QuickActions } from '@/components/dashboard/QuickActions'

interface DashboardContentProps {
    user: any
    stats: any
    recentActivity: any[]
    pendingApprovals: any[]
    charts: React.ReactNode
}



export function DashboardContent({
    user,
    stats,
    recentActivity,
    pendingApprovals,
    charts
}: DashboardContentProps) {

    // Secure View State
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false)

    const handleVerificationSuccess = () => {
        // Logic to show sensitive data if we move it to a global context or pass down
        // For now, the eye toggle inside DashboardHero manages its own local state for standard obscuring.
        // If we want a global "Auth required to see balances" we would pass a prop.
    }

    return (
        <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-6 sm:space-y-8 pb-10"
        >

            {/* Zen Hero Card - Dashboard Command Center */}
            <DashboardHero
                user={user}
                stats={stats}
                pendingApprovalsCount={pendingApprovals.length}
                recentActivityCount={recentActivity.length}
            />

            {/* Main Content Area - Sequential Layout */}
            <div className="space-y-6 sm:space-y-8">

                {/* 1. Performance (Growth & Analytics) */}
                <FinancialOverview />
                {charts}

                {/* 2. Live Feed (Recent Activity) */}
                <ActivityFeed recentActivity={recentActivity} />

                {/* 3. Workspace (Quick Actions) */}
                <QuickActions pendingApprovals={pendingApprovals} user={user} />

            </div>
            {/* Password Verification Dialog */}
            <SecurityVerificationModal
                open={isVerificationModalOpen}
                onOpenChange={setIsVerificationModalOpen}
                onVerified={handleVerificationSuccess}
            />
        </motion.div>
    )
}
