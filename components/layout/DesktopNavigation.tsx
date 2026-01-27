'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Zap, Landmark, Users, User, Shield } from 'lucide-react'
import { motion } from 'framer-motion'
import { itemFadeIn } from '@/lib/motions'
import { UBankLogo } from '@/components/ui/Logo'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/GlassCard'

const NavigationLink = ({ item, isActive }: { item: any; isActive: boolean }) => (
  <motion.div variants={itemFadeIn}>
    <Link
      href={item.href}
      className={cn(
        "relative group px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-3 overflow-hidden",
        isActive
          ? "text-emerald-400 bg-white/5 border border-emerald-500/20 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]"
          : "text-slate-400 hover:text-white hover:bg-white/5"
      )}
    >
      {/* Active Glow Background */}
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-50" />
      )}

      {/* Active Line Indicator */}
      {isActive && (
        <motion.div
          layoutId="active-nav-line"
          className="absolute left-0 w-1 h-6 bg-emerald-500 rounded-r-full shadow-[0_0_10px_rgba(16,185,129,0.8)]"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}

      <item.icon className={cn(
        "w-5 h-5 transition-transform duration-300 group-hover:scale-110 relative z-10",
        isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-200"
      )} />
      <span className="whitespace-nowrap relative z-10">{item.name}</span>

      {item.badge && (
        <span className="ml-auto bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[10px] px-2 py-0.5 rounded-md font-bold relative z-10">
          {item.badge}
        </span>
      )}
    </Link>
  </motion.div>
)

export function DesktopNavigation() {
  const { user } = useAuth()
  const pathname = usePathname()

  const menuItems = [
    { name: 'Pulse', href: '/dashboard', icon: Zap },
    { name: 'Vault', href: '/vault', icon: Landmark },
    { name: 'Groups', href: '/groups', icon: Users },
    { name: 'Profile', href: '/profile', icon: User },
  ]

  if (user?.role === 'SUPER_ADMIN' || user?.role === 'REGIONAL_ADMIN') {
    menuItems.push({ name: 'Verifications', href: '/admin/verifications', icon: Shield })
  }

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-72 flex-col z-50 bg-slate-950 text-white">
      {/* Sidebar Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950 z-0 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-96 bg-emerald-900/10 blur-[100px] z-0 pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full p-6 border-r border-white/5">
        {/* Logo Section */}
        <div className="mb-10 px-2 pt-2">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg shadow-emerald-900/20">
              <UBankLogo className="w-6 h-6" />
            </div>
            <span className="text-xl font-black text-white tracking-tight group-hover:text-emerald-400 transition-colors">uBank</span>
          </Link>
        </div>

        {/* Menu Section */}
        <div className="flex-1 space-y-8 overflow-y-auto no-scrollbar">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 px-4">
              Menu
            </p>
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <NavigationLink key={item.href} item={item} isActive={pathname === item.href} />
              ))}
            </nav>
          </div>
        </div>

        {/* Invite App Card */}
        <div className="mt-auto pt-6">
          <GlassCard className="relative p-5 rounded-2xl border-white/10 bg-gradient-to-br from-emerald-900/40 to-slate-900/40 overflow-hidden group" hover={true}>
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/20 rounded-full blur-[40px] opacity-40 group-hover:opacity-60 transition-opacity" />

            <div className="relative z-10 flex flex-col gap-3">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Users className="w-4 h-4" />
                </div>
                <h4 className="text-white font-bold text-sm">Grow circle</h4>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed font-medium">
                Banking is better together. Invite friends to your group.
              </p>
              <Link href="/groups" className="w-full">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-10 bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:text-white hover:bg-emerald-500 hover:border-emerald-500 rounded-lg font-bold transition-all text-xs"
                >
                  Invite Friends
                </Button>
              </Link>
            </div>
          </GlassCard>
        </div>
      </div>
    </aside>
  )
}
