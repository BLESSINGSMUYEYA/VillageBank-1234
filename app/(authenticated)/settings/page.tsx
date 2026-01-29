0'use client';

import { useAuth } from '@/components/providers/AuthProvider'
import { useLanguage } from '@/components/providers/LanguageProvider'
import PasskeyManager from '@/components/auth/PasskeyManager'
import { VerificationForm } from '@/components/settings/VerificationForm'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Save,
  Fingerprint,
  Smartphone,
  ShieldCheck,
  ArrowLeft,
  Lock,
  Globe,
  Clock
} from 'lucide-react'
import { motion } from 'framer-motion'
import { staggerContainer, itemFadeIn, fadeIn } from '@/lib/motions'
import { GlassCard } from '@/components/ui/GlassCard'
import { cn } from '@/lib/utils'

interface UserProfile {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  region: string
  role: string
}

export default function SettingsPage() {
  const { user } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    region: '',
  })

  useEffect(() => {
    fetchProfile()
  }, [user])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/users/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setFormData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phoneNumber: data.phoneNumber || '',
          region: data.region || '',
        })
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchProfile() // Refresh profile data
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      console.error('Profile update error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6 sm:space-y-8 pb-20"
    >
      <motion.div variants={fadeIn} className="max-w-4xl mx-auto w-full">
        <Link href="/profile" className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-emerald-600 dark:hover:text-banana transition-all duration-300 group mb-6">
          <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform duration-300 relative z-10" />
          {t('settings_page.back_to_profile')}
        </Link>
        <div className="hidden md:block mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter text-main mb-2 text-left break-words">
            {t('settings_page.title')}
            <span className="text-banana">.</span>
          </h1>
          <p className="text-xs sm:text-sm md:text-base font-medium text-slate-500 leading-relaxed max-w-xl">
            {t('settings_page.subtitle')}
          </p>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto">
        <motion.div variants={itemFadeIn}>
          <GlassCard className="p-0 overflow-hidden" hover={false}>
            {/* Header Section */}
            <div className="relative border-b border-white/10 dark:border-white/5 p-5 sm:p-6 bg-slate-50/50 dark:bg-white/5">
              <div className="flex items-center gap-5 sm:gap-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/20 dark:from-banana/10 dark:to-banana/20 flex items-center justify-center text-blue-600 dark:text-banana shadow-inner ring-1 ring-white/20 shrink-0">
                  <Fingerprint className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-foreground tracking-tight">{t('settings_page.personal_identity')}</h2>
                  <p className="text-xs sm:text-sm font-bold text-muted-foreground/70 mt-1">
                    {t('settings_page.updates_sync_desc')}
                  </p>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-5 sm:p-6 sm:p-8 relative">
              <form onSubmit={handleSaveProfile} className="space-y-8 sm:space-y-10">

                {/* Name Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                  <div className="space-y-2 group/input">
                    <Label htmlFor="firstName" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 group-focus-within/input:text-emerald-600 dark:group-focus-within/input:text-banana transition-colors">{t('settings_page.first_name')}</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="Ex: John"
                      className="rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-white/5 h-12 sm:h-14 font-bold shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50 px-4 sm:px-6 transition-all hover:bg-slate-100 dark:hover:bg-slate-900/80"
                    />
                  </div>
                  <div className="space-y-2 group/input">
                    <Label htmlFor="lastName" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 group-focus-within/input:text-emerald-600 dark:group-focus-within/input:text-banana transition-colors">{t('settings_page.last_name')}</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Ex: Doe"
                      className="rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-white/5 h-12 sm:h-14 font-bold shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50 px-4 sm:px-6 transition-all hover:bg-slate-100 dark:hover:bg-slate-900/80"
                    />
                  </div>
                </div>

                {/* Locked Fields - Vault Style */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 flex items-center gap-2">
                      {t('settings_page.email_label')}
                    </Label>
                    <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> {t('settings_page.verified')}
                    </span>
                  </div>
                  <div className="relative group/locked cursor-not-allowed opacity-80 hover:opacity-100 transition-opacity">
                    <div className="absolute inset-0 bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 pointer-events-none group-hover/locked:border-solid group-hover/locked:border-emerald-500/30 transition-all" />
                    <Input
                      type="email"
                      value={profile?.email || user?.email || ''}
                      disabled
                      className="relative bg-transparent border-none h-12 sm:h-14 font-black shadow-none px-4 sm:px-6 pr-12 text-foreground/70"
                    />
                    <Lock className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                  </div>
                </div>

                {/* Contact & Region */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                  <div className="space-y-2 group/input">
                    <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 group-focus-within/input:text-emerald-600 dark:group-focus-within/input:text-banana transition-colors">{t('settings_page.phone_label')}</Label>
                    <div className="relative">
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        placeholder="+265..."
                        className="rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-white/5 h-12 sm:h-14 font-bold shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50 px-4 sm:px-6 transition-all hover:bg-slate-100 dark:hover:bg-slate-900/80"
                      />
                      <Smartphone className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                    </div>
                  </div>

                  <div className="space-y-2 group/input">
                    <Label htmlFor="region" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 group-focus-within/input:text-emerald-600 dark:group-focus-within/input:text-banana transition-colors">{t('settings_page.region_label')}</Label>
                    <Select value={formData.region} onValueChange={(value) => setFormData(prev => ({ ...prev, region: value }))}>
                      <SelectTrigger className="rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-white/5 h-12 sm:h-14 font-bold shadow-sm focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 px-4 sm:px-6 hover:bg-slate-100 dark:hover:bg-slate-900/80 transition-all text-sm sm:text-base">
                        <SelectValue placeholder={t('settings_page.select_domain')} />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-white/20 dark:border-white/10 shadow-2xl overflow-hidden p-1">
                        <SelectItem value="NORTHERN" className="font-bold cursor-pointer rounded-xl focus:bg-emerald-500/10 focus:text-emerald-600 dark:focus:bg-emerald-500/10 dark:focus:text-emerald-400 py-3 px-4 transition-colors">{t('settings_page.northern_region')}</SelectItem>
                        <SelectItem value="CENTRAL" className="font-bold cursor-pointer rounded-xl focus:bg-emerald-500/10 focus:text-emerald-600 dark:focus:bg-emerald-500/10 dark:focus:text-emerald-400 py-3 px-4 transition-colors">{t('settings_page.central_region')}</SelectItem>
                        <SelectItem value="SOUTHERN" className="font-bold cursor-pointer rounded-xl focus:bg-emerald-500/10 focus:text-emerald-600 dark:focus:bg-emerald-500/10 dark:focus:text-emerald-400 py-3 px-4 transition-colors">{t('settings_page.southern_region')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Preferences */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 pt-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 flex items-center gap-2">
                    <Globe className="w-3 h-3" /> {t('settings_page.preferred_language')}
                  </Label>
                  <Select value={language} onValueChange={(val: any) => setLanguage(val)}>
                    <SelectTrigger className="rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-white/5 h-12 sm:h-14 font-bold shadow-sm focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 px-4 sm:px-6 hover:bg-slate-100 dark:hover:bg-slate-900/80 transition-all text-sm sm:text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-white/20 dark:border-white/10 shadow-2xl overflow-hidden p-1">
                      <SelectItem value="en" className="font-bold cursor-pointer rounded-xl focus:bg-emerald-500/10 focus:text-emerald-600 dark:focus:bg-emerald-500/10 dark:focus:text-emerald-400 py-3 px-4 transition-colors">English (International)</SelectItem>
                      <SelectItem value="ny" className="font-bold cursor-pointer rounded-xl focus:bg-emerald-500/10 focus:text-emerald-600 dark:focus:bg-emerald-500/10 dark:focus:text-emerald-400 py-3 px-4 transition-colors">Chichewa (Malawi)</SelectItem>
                      <SelectItem value="bem" className="font-bold cursor-pointer rounded-xl focus:bg-emerald-500/10 focus:text-emerald-600 dark:focus:bg-emerald-500/10 dark:focus:text-emerald-400 py-3 px-4 transition-colors">Bemba (Zambia)</SelectItem>
                      <SelectItem value="fr" className="font-bold cursor-pointer rounded-xl focus:bg-emerald-500/10 focus:text-emerald-600 dark:focus:bg-emerald-500/10 dark:focus:text-emerald-400 py-3 px-4 transition-colors">Français (Global)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 flex items-center gap-2">
                    <Clock className="w-3 h-3" /> {t('settings_page.timezone')}
                  </Label>
                  <Select defaultValue="CAT">
                    <SelectTrigger className="rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-white/5 h-12 sm:h-14 font-bold shadow-sm focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 px-4 sm:px-6 hover:bg-slate-100 dark:hover:bg-slate-900/80 transition-all text-sm sm:text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-white/20 dark:border-white/10 shadow-2xl overflow-hidden p-1">
                      <SelectItem value="CAT" className="font-bold cursor-pointer rounded-xl focus:bg-emerald-500/10 focus:text-emerald-600 dark:focus:bg-emerald-500/10 dark:focus:text-emerald-400 py-3 px-4 transition-colors">Central African Time (UTC+2)</SelectItem>
                      <SelectItem value="UTC" className="font-bold cursor-pointer rounded-xl focus:bg-emerald-500/10 focus:text-emerald-600 dark:focus:bg-emerald-500/10 dark:focus:text-emerald-400 py-3 px-4 transition-colors">Universal Time (UTC+0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Footer / Actions */}
                <div className="pt-8 border-t border-slate-200 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-2 pr-4 rounded-xl border border-slate-200 dark:border-white/5 order-2 sm:order-1">
                    <Badge className="bg-emerald-500 text-white font-black border-none px-3 py-1 rounded-lg text-[9px] tracking-widest uppercase shadow-sm">
                      {profile?.role || user?.role || 'MEMBER'}
                    </Badge>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">{t('settings_page.system_clearance')}</span>
                  </div>

                  {/* Shimmer Button Container */}
                  <div className="relative group rounded-2xl bg-gradient-to-b from-emerald-500 to-emerald-600 p-[1px] shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-shadow w-full sm:w-auto order-1 sm:order-2">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="relative w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white dark:text-white border-0 rounded-2xl h-14 px-10 font-black tracking-wide overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />
                      <Save className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform relative z-10" />
                      <span className="relative z-10">{isLoading ? t('settings_page.syncing') : t('settings_page.update_identity')}</span>
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </GlassCard>
        </motion.div >
      </div >



      <div className="max-w-4xl mx-auto mt-8">
        <motion.div variants={itemFadeIn}>
          {/* Verification Section */}
          <div className="mb-8">
            <VerificationForm />
          </div>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto mt-8">
        <motion.div variants={itemFadeIn}>
          <GlassCard className="p-0 overflow-hidden" hover={false}>
            {/* Header Section */}
            <div className="relative border-b border-white/10 dark:border-white/5 p-5 sm:p-6 bg-slate-50/50 dark:bg-white/5">
              <div className="flex items-center gap-5 sm:gap-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/20 dark:from-banana/10 dark:to-banana/20 flex items-center justify-center text-blue-600 dark:text-banana shadow-inner ring-1 ring-white/20 shrink-0">
                  <Lock className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-foreground tracking-tight">{t('settings_page.security_title')}</h2>
                  <p className="text-xs sm:text-sm font-bold text-muted-foreground/70 mt-1">
                    {t('settings_page.security_desc')}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 sm:p-6 sm:p-8 relative">
              <PasskeyManager />
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </motion.div >
  )
}


