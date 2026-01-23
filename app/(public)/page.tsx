import { Users, DollarSign, TrendingUp } from 'lucide-react'
import { MarketingHeader } from '@/components/marketing/MarketingHeader'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import { LandingContent } from '@/components/landing/LandingContent'

// Enable ISR - revalidate every hour
export const revalidate = 3600

export default function Home() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 selection:bg-emerald-500/30 overflow-x-hidden font-sans">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-emerald-600/10 dark:bg-emerald-600/20 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute top-[20%] -right-[5%] w-[35%] h-[35%] bg-teal-600/10 dark:bg-teal-600/20 rounded-full blur-[100px] animate-pulse-slow delay-700" />
                <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] bg-emerald-400/10 dark:bg-emerald-400/20 rounded-full blur-[110px] animate-pulse-slow delay-1000" />
            </div>

            <div className="relative z-10">
                <MarketingHeader />
                <LandingContent />
                <MarketingFooter />
            </div>
        </div>
    )
}
