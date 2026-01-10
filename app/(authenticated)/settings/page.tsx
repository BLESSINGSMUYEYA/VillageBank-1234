'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Settings2,
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
import { PageHeader } from '@/components/layout/PageHeader'
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
      <motion.div variants={fadeIn}>
        <Link href="/dashboard" className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-blue-600 dark:hover:text-banana transition-all duration-300 group mb-4">
          <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform duration-300 relative z-10" />
          Back to Hub
        </Link>
        <PageHeader
          title="My Profile"
          description={
            <span className="flex items-center gap-1.5 opacity-80">
              <Settings2 className="w-4 h-4 text-blue-600 dark:text-banana" />
              Manage your personal identity details.
            </span>
          }
        />
      </motion.div>

      <div className="max-w-4xl mx-auto">
        <motion.div variants={itemFadeIn}>
          {/* Zen Container - Premium Style */}
          <div className="relative overflow-hidden rounded-[32px] border border-white/20 dark:border-white/10 shadow-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl group/card">

            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-1000 pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-banana/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header Section */}
            <div className="relative border-b border-white/10 dark:border-white/5 p-5 sm:p-6">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 opacity-80" />
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/20 dark:from-banana/10 dark:to-banana/20 flex items-center justify-center text-blue-600 dark:text-banana shadow-inner ring-1 ring-white/20">
                  <Fingerprint className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Personal Identity</h2>
                  <p className="text-sm font-bold text-muted-foreground/70 italic">
                    Updates here will sync across all your community groups immediately.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-5 sm:p-6 relative">
              <form onSubmit={handleSaveProfile} className="space-y-10">

                {/* Name Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-3 group/input">
                    <Label htmlFor="firstName" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 group-focus-within/input:text-blue-600 dark:group-focus-within/input:text-banana transition-colors">First Legal Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="Ex: John"
                      className="rounded-2xl bg-white/50 dark:bg-slate-950/30 border-white/20 dark:border-white/5 h-14 font-bold shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 px-6 transition-all hover:bg-white/60 dark:hover:bg-slate-950/50"
                    />
                  </div>
                  <div className="space-y-3 group/input">
                    <Label htmlFor="lastName" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 group-focus-within/input:text-blue-600 dark:group-focus-within/input:text-banana transition-colors">Surname / Family Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Ex: Doe"
                      className="rounded-2xl bg-white/50 dark:bg-slate-950/30 border-white/20 dark:border-white/5 h-14 font-bold shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 px-6 transition-all hover:bg-white/60 dark:hover:bg-slate-950/50"
                    />
                  </div>
                </div>

                {/* Locked Fields - Vault Style */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 flex items-center gap-2">
                      Primary Authentication Email
                    </Label>
                    <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> VERIFIED
                    </span>
                  </div>
                  <div className="relative group/locked cursor-not-allowed opacity-80 hover:opacity-100 transition-opacity">
                    <div className="absolute inset-0 bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 pointer-events-none group-hover/locked:border-solid group-hover/locked:border-emerald-500/30 transition-all" />
                    <Input
                      type="email"
                      value={profile?.email || user?.email || ''}
                      disabled
                      className="relative bg-transparent border-none h-14 font-black shadow-none px-6 pr-12 text-foreground/70"
                    />
                    <Lock className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                  </div>
                </div>

                {/* Contact & Region */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-3 group/input">
                    <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 group-focus-within/input:text-blue-600 dark:group-focus-within/input:text-banana transition-colors">Contact Dial Code</Label>
                    <div className="relative">
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        placeholder="+265..."
                        className="rounded-2xl bg-white/50 dark:bg-slate-950/30 border-white/20 dark:border-white/5 h-14 font-bold shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 px-6 transition-all hover:bg-white/60 dark:hover:bg-slate-950/50"
                      />
                      <Smartphone className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                    </div>
                  </div>

                  <div className="space-y-3 group/input">
                    <Label htmlFor="region" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 group-focus-within/input:text-blue-600 dark:group-focus-within/input:text-banana transition-colors">Geographic Domain</Label>
                    <Select value={formData.region} onValueChange={(value) => setFormData(prev => ({ ...prev, region: value }))}>
                      <SelectTrigger className="rounded-2xl bg-white/50 dark:bg-slate-950/30 border-white/20 dark:border-white/5 h-14 font-bold shadow-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 px-6 hover:bg-white/60 dark:hover:bg-slate-950/50 transition-all text-base">
                        <SelectValue placeholder="Select Domain" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-white/20 dark:border-white/10 shadow-2xl overflow-hidden p-1">
                        <SelectItem value="NORTHERN" className="font-bold cursor-pointer rounded-xl focus:bg-blue-500/10 focus:text-blue-600 dark:focus:bg-blue-500/10 dark:focus:text-blue-400 py-3 px-4 transition-colors">NORTHERN REGION (MZUZU)</SelectItem>
                        <SelectItem value="CENTRAL" className="font-bold cursor-pointer rounded-xl focus:bg-blue-500/10 focus:text-blue-600 dark:focus:bg-blue-500/10 dark:focus:text-blue-400 py-3 px-4 transition-colors">CENTRAL REGION (LILONGWE)</SelectItem>
                        <SelectItem value="SOUTHERN" className="font-bold cursor-pointer rounded-xl focus:bg-blue-500/10 focus:text-blue-600 dark:focus:bg-blue-500/10 dark:focus:text-blue-400 py-3 px-4 transition-colors">SOUTHERN REGION (BLANTYRE)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Preferences */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-2">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 flex items-center gap-2">
                      <Globe className="w-3 h-3" /> Preferred Language
                    </Label>
                    <Select defaultValue="EN">
                      <SelectTrigger className="rounded-2xl bg-white/50 dark:bg-slate-950/30 border-white/20 dark:border-white/5 h-14 font-bold shadow-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 px-6 hover:bg-white/60 dark:hover:bg-slate-950/50 transition-all text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-white/20 dark:border-white/10 shadow-2xl overflow-hidden p-1">
                        <SelectItem value="EN" className="font-bold cursor-pointer rounded-xl focus:bg-blue-500/10 focus:text-blue-600 dark:focus:bg-blue-500/10 dark:focus:text-blue-400 py-3 px-4 transition-colors">English (International)</SelectItem>
                        <SelectItem value="CH" className="font-bold cursor-pointer rounded-xl focus:bg-blue-500/10 focus:text-blue-600 dark:focus:bg-blue-500/10 dark:focus:text-blue-400 py-3 px-4 transition-colors">Chichewa (Local)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 flex items-center gap-2">
                      <Clock className="w-3 h-3" /> Timezone
                    </Label>
                    <Select defaultValue="CAT">
                      <SelectTrigger className="rounded-2xl bg-white/50 dark:bg-slate-950/30 border-white/20 dark:border-white/5 h-14 font-bold shadow-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 px-6 hover:bg-white/60 dark:hover:bg-slate-950/50 transition-all text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-white/20 dark:border-white/10 shadow-2xl overflow-hidden p-1">
                        <SelectItem value="CAT" className="font-bold cursor-pointer rounded-xl focus:bg-blue-500/10 focus:text-blue-600 dark:focus:bg-blue-500/10 dark:focus:text-blue-400 py-3 px-4 transition-colors">Central African Time (UTC+2)</SelectItem>
                        <SelectItem value="UTC" className="font-bold cursor-pointer rounded-xl focus:bg-blue-500/10 focus:text-blue-600 dark:focus:bg-blue-500/10 dark:focus:text-blue-400 py-3 px-4 transition-colors">Universal Time (UTC+0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Footer / Actions */}
                <div className="pt-8 border-t border-white/10 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-3 bg-white/50 dark:bg-slate-900/50 p-2 pr-4 rounded-xl border border-white/10">
                    <Badge className="bg-emerald-500 text-white font-black border-none px-3 py-1 rounded-lg text-[9px] tracking-widest uppercase shadow-sm">
                      {profile?.role || user?.role || 'MEMBER'}
                    </Badge>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">System Clearance</span>
                  </div>

                  {/* Shimmer Button Container */}
                  <div className="relative group rounded-2xl bg-gradient-to-b from-blue-500 to-blue-600 p-[1px] shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-shadow">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="relative w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white dark:text-white border-0 rounded-2xl h-14 px-10 font-black tracking-wide overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />
                      <Save className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform relative z-10" />
                      <span className="relative z-10">{isLoading ? 'Syncing...' : 'Update Identity'}</span>
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}


