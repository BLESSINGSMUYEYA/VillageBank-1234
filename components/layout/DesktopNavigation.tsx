'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { useLanguage } from '@/components/providers/LanguageProvider'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Zap, Landmark, Users, User, BarChart3, Settings, LogOut, Smartphone, Wallet, History } from 'lucide-react'
import { motion } from 'framer-motion'
import { itemFadeIn } from '@/lib/motions'
import { UBankLogo } from '@/components/ui/Logo'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const NavigationLink = ({ item, isActive }: { item: any; isActive: boolean }) => (
  <motion.div variants={itemFadeIn}>
    <Link
      href={item.href}
      className={cn(
        "relative group px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-3",
        isActive
          ? "text-[#1B4332] bg-transparent"
          : "text-[#94A3B8] hover:text-[#1B4332] hover:bg-slate-50"
      )}
    >
      {/* Active Line Indicator */}
      {isActive && (
        <motion.div
          layoutId="active-nav-line"
          className="absolute left-0 w-1 h-6 bg-[#2D6A4F] rounded-r-full"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}

      <item.icon className={cn(
        "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
        isActive ? "text-[#2D6A4F] stroke-[2.5px]" : "text-[#94A3B8]"
      )} />
      <span className="whitespace-nowrap">{item.name}</span>

      {item.badge && (
        <span className="ml-auto bg-[#1B4332] text-white text-[10px] px-2 py-0.5 rounded-md font-bold">
          {item.badge}
        </span>
      )}
    </Link>
  </motion.div>
)

export function DesktopNavigation() {
  const { logout } = useAuth()
  const pathname = usePathname()

  const menuItems = [
    { name: 'Pulse', href: '/dashboard', icon: Zap },
    { name: 'Vault', href: '/vault', icon: Landmark },
    { name: 'Groups', href: '/groups', icon: Users },
    { name: 'Profile', href: '/profile', icon: User },
  ]

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-72 flex-col z-50 bg-[#F8FAFC]">
      <div className="relative flex flex-col h-full p-8 border-r border-slate-200">
        {/* Logo Section */}
        <div className="mb-12">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#D8F3DC] rounded-xl flex items-center justify-center">
              <UBankLogo className="w-6 h-6 text-[#2D6A4F]" />
            </div>
            <span className="text-xl font-bold text-[#1B4332]">uBank</span>
          </Link>
        </div>

        {/* Menu Section */}
        <div className="flex-1 space-y-8 overflow-y-auto no-scrollbar">
          <div>
            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-4 px-4">
              Menu
            </p>
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <NavigationLink key={item.href} item={item} isActive={pathname === item.href} />
              ))}
            </nav>
          </div>
        </div>

        {/* Download App Card */}
        <div className="mt-auto pt-8">
          <div className="relative p-6 rounded-3xl bg-[#081C15] overflow-hidden group">
            {/* Abstract Background Shapes */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#2D6A4F] rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#D8F3DC] rounded-full blur-[40px] opacity-10 group-hover:opacity-20 transition-opacity" />

            <div className="relative z-10 flex flex-col gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">Invite Friends</h4>
                <p className="text-white/60 text-[11px] mt-1 leading-relaxed">
                  Banking is better together. Grow your circle.
                </p>
              </div>
              <Link href="/groups">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-[#1B4332] border-0 text-white rounded-xl py-5 font-bold hover:bg-[#2D6A4F] transition-all"
                >
                  Invite
                </Button>
              </Link>
            </div>

            {/* User Icon Float */}
            <div className="absolute -top-1 left-2 w-6 h-6 rounded-full border-2 border-[#081C15] bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white">
              +
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
