
'use client'
import { useState } from 'react'

import { motion } from 'framer-motion'
import { staggerContainer } from '@/lib/motions'
import { SecurityVerificationModal } from './SecurityVerificationModal'
import { DashboardHero } from '@/components/dashboard/DashboardHero'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { QuickActions } from '@/components/dashboard/QuickActions'

interface DashboardContentProps {
    user: any
    stats: any
    recentActivity: any[]
    pendingApprovals: any[]
    reminders: any[]
}



import { DashboardWidgets } from '@/components/dashboard/DashboardWidgets'
import { NextSteps } from '@/components/dashboard/NextSteps'

export function DashboardContent({
    user,
    stats,
    recentActivity,
    pendingApprovals,
    reminders
}: DashboardContentProps) {

    // Secure View State
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false)

    const handleVerificationSuccess = () => {
        // Logic
    }

    return (
        <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-8 sm:space-y-12 pb-20"
        >
            {/* 1. Hero / Metrics (Full Width) */}
            <DashboardHero
                key="dashboard-hero"
                user={user}
                stats={stats}
                pendingApprovalsCount={pendingApprovals?.length || 0}
                recentActivityCount={recentActivity?.length || 0}
            />

            {/* Quick Actions (Repositioned between Hero and Content) */}
            <QuickActions key="dashboard-quick-actions" pendingApprovals={pendingApprovals} user={user} />

            {/* 2. Command Center: Insights + Widgets (Left) aligned with Activity Sidebar (Right) */}
            <div key="dashboard-command-center" className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Left: Interactive Tools & Insights */}
                <div className="lg:col-span-2 space-y-12">
                    <NextSteps key="dashboard-next-steps" user={user} stats={stats} />
                    <DashboardWidgets key="dashboard-widgets" stats={stats} reminders={reminders} userId={user.id} />
                </div>

                {/* Right: Unified Sidebar (Recent Activity) */}
                <div className="space-y-8">
                    <ActivityFeed recentActivity={recentActivity} />
                </div>
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
