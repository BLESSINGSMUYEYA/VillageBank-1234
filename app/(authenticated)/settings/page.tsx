'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  User as UserIcon,
  Bell,
  Shield,
  CreditCard,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Settings2,
  Save,
  Fingerprint,
  Smartphone,
  Mail,
  Plus,
  ArrowLeft
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { staggerContainer, itemFadeIn, fadeIn } from '@/lib/motions'
import { GlassCard } from '@/components/ui/GlassCard'
import { PageHeader } from '@/components/layout/PageHeader'
import { cn } from '@/lib/utils'
import { MemberBankDetails } from '@/components/settings/MemberBankDetails'

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

  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // TODO: Implement notification preferences API
    setTimeout(() => setIsLoading(false), 1000)
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-8 sm:space-y-12 pb-20"
    >
      <motion.div variants={fadeIn}>
        <Link href="/dashboard" className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-blue-600 dark:hover:text-banana transition-all duration-300 group mb-4">
          <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
          Back to Hub
        </Link>
        <PageHeader
          title="Account Configuration"
          description={
            <span className="flex items-center gap-1.5 opacity-80">
              <Settings2 className="w-4 h-4 text-blue-600 dark:text-banana" />
              Manage your identity, communications, and security protocols.
            </span>
          }
        />
      </motion.div>

      <div className="max-w-5xl mx-auto">
        <Tabs defaultValue="profile" className="space-y-8 sm:space-y-10">
          <div className="sticky top-0 z-20 pt-2 pointer-events-none">
            <TabsList className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl p-1.5 rounded-2xl border border-white/40 dark:border-white/10 w-full justify-start h-16 shadow-xl pointer-events-auto overflow-x-auto no-scrollbar">
              <TabsTrigger value="profile" className="rounded-xl px-4 sm:px-8 h-full font-black text-xs uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-banana dark:data-[state=active]:text-blue-950 transition-all flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                Identity
              </TabsTrigger>
              <TabsTrigger value="notifications" className="rounded-xl px-4 sm:px-8 h-full font-black text-xs uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-banana dark:data-[state=active]:text-blue-950 transition-all flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Alerts
              </TabsTrigger>
              <TabsTrigger value="security" className="rounded-xl px-4 sm:px-8 h-full font-black text-xs uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-banana dark:data-[state=active]:text-blue-950 transition-all flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Core Security
              </TabsTrigger>
              <TabsTrigger value="payment" className="rounded-xl px-4 sm:px-8 h-full font-black text-xs uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-banana dark:data-[state=active]:text-blue-950 transition-all flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Financial
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="profile" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <motion.div variants={itemFadeIn}>
              <GlassCard className="p-0 border-none overflow-hidden" hover={false}>
                <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600" />
                <CardHeader className="p-8 sm:p-10 border-b border-white/10 dark:border-white/5">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600/10 dark:bg-banana/10 flex items-center justify-center text-blue-600 dark:text-banana">
                      <Fingerprint className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-black text-foreground">Personal Identity</CardTitle>
                      <CardDescription className="text-sm font-bold opacity-70 italic">
                        Updates here will sync across all your community groups immediately.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 sm:p-10">
                  <form onSubmit={handleSaveProfile} className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">First Legal Name</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                          placeholder="Ex: John"
                          className="rounded-[1.2rem] bg-white/40 dark:bg-slate-900/40 border-none h-14 font-bold shadow-inner focus-visible:ring-blue-500/30 px-6"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Surname / Family Name</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                          placeholder="Ex: Doe"
                          className="rounded-[1.2rem] bg-white/40 dark:bg-slate-900/40 border-none h-14 font-bold shadow-inner focus-visible:ring-blue-500/30 px-6"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Primary Authentication Email</Label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          value={profile?.email || user?.email || ''}
                          disabled
                          className="rounded-[1.2rem] bg-slate-100/50 dark:bg-slate-800/50 border-none h-14 font-black opacity-60 shadow-inner px-6 pr-12 cursor-not-allowed"
                        />
                        <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                      </div>
                      <p className="text-[10px] font-bold text-muted-foreground/60 italic ml-1">
                        Locked for security. Contact support to initiate an electronic identity transfer.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Contact Dial Code</Label>
                        <div className="relative">
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                            placeholder="+265..."
                            className="rounded-[1.2rem] bg-white/40 dark:bg-slate-900/40 border-none h-14 font-bold shadow-inner focus-visible:ring-blue-500/30 px-6"
                          />
                          <Smartphone className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="region" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Geographic Domain</Label>
                        <Select value={formData.region} onValueChange={(value) => setFormData(prev => ({ ...prev, region: value }))}>
                          <SelectTrigger className="rounded-[1.2rem] bg-white/40 dark:bg-slate-900/40 border-none h-14 font-black text-xs uppercase tracking-widest shadow-inner px-6">
                            <SelectValue placeholder="Select Domain" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-white/10 dark:bg-slate-950/90 backdrop-blur-xl">
                            <SelectItem value="NORTHERN" className="font-bold text-xs uppercase tracking-wider">NORTHERN REGION (MZUZU)</SelectItem>
                            <SelectItem value="CENTRAL" className="font-bold text-xs uppercase tracking-wider">CENTRAL REGION (LILONGWE)</SelectItem>
                            <SelectItem value="SOUTHERN" className="font-bold text-xs uppercase tracking-wider">SOUTHERN REGION (BLANTYRE)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Preferred Language</Label>
                        <Select defaultValue="EN">
                          <SelectTrigger className="rounded-[1.2rem] bg-white/40 dark:bg-slate-900/40 border-none h-14 font-black text-xs uppercase tracking-widest shadow-inner px-6">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl dark:bg-slate-950/90 backdrop-blur-xl">
                            <SelectItem value="EN" className="font-bold text-xs uppercase tracking-wider">English (International)</SelectItem>
                            <SelectItem value="CH" className="font-bold text-xs uppercase tracking-wider">Chichewa (Local)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Universal Timezone</Label>
                        <Select defaultValue="CAT">
                          <SelectTrigger className="rounded-[1.2rem] bg-white/40 dark:bg-slate-900/40 border-none h-14 font-black text-xs uppercase tracking-widest shadow-inner px-6">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl dark:bg-slate-950/90 backdrop-blur-xl">
                            <SelectItem value="CAT" className="font-bold text-xs uppercase tracking-wider">Central African Time (UTC+2)</SelectItem>
                            <SelectItem value="UTC" className="font-bold text-xs uppercase tracking-wider">Universal Time (UTC+0)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/10 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black border-none px-4 py-2 rounded-xl text-[10px] tracking-widest uppercase">
                          {profile?.role || user?.role || 'VERIFIED MEMBER'}
                        </Badge>
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">System Clearance Level</span>
                      </div>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 dark:bg-banana dark:hover:bg-yellow-400 dark:text-blue-950 font-black rounded-2xl h-14 px-10 shadow-2xl transition-all hover:scale-105 active:scale-95 group"
                      >
                        <Save className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                        {isLoading ? 'Syncing...' : 'Update Identity'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </GlassCard>
            </motion.div>
          </TabsContent>

          <TabsContent value="notifications" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <motion.div variants={itemFadeIn}>
              <GlassCard className="p-0 border-none overflow-hidden" hover={false}>
                <div className="h-2 bg-gradient-to-r from-orange-400 via-red-500 to-orange-400" />
                <CardHeader className="p-8 sm:p-10 border-b border-white/10 dark:border-white/5">
                  <CardTitle className="text-2xl font-black text-foreground">Alert Hub</CardTitle>
                  <CardDescription className="text-sm font-bold opacity-70 italic">
                    Control how the network communicates urgent financial milestones.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 sm:p-10">
                  <form onSubmit={handleSaveNotifications} className="space-y-6">
                    <div className="space-y-4">
                      {[
                        { id: 'email', title: 'Transmission Logic', desc: 'Synthesized summaries via SMTP encryption', icon: Mail },
                        { id: 'remind', title: 'Stake Reminders', desc: 'Predictive alerts for monthly liquidity events', icon: CreditCard },
                        { id: 'loan', title: 'Credit Status', desc: 'Real-time updates on loan deployment cycles', icon: ShieldCheck },
                        { id: 'group', title: 'Ecosystem Pulse', desc: 'Asynchronous updates from joined circles', icon: Bell }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-6 rounded-[1.5rem] bg-white/40 dark:bg-slate-900/40 border border-white/20 dark:border-white/5 group hover:bg-white/60 dark:hover:bg-slate-900/60 transition-all">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <item.icon className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="font-black text-foreground tracking-tight">{item.title}</h4>
                              <p className="text-[10px] font-bold text-muted-foreground opacity-60 uppercase tracking-widest">{item.desc}</p>
                            </div>
                          </div>
                          <div className="relative inline-flex items-center cursor-pointer group/toggle">
                            <input type="checkbox" defaultChecked={idx < 3} className="sr-only peer" />
                            <div className="w-14 h-8 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer-checked:bg-orange-500 transition-colors after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-6" />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-6">
                      <Button type="submit" disabled={isLoading} className="w-full bg-foreground text-background font-black rounded-2xl h-14 shadow-xl hover:scale-[1.02] transition-all">
                        Commit Preferences
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </GlassCard>
            </motion.div>
          </TabsContent>

          <TabsContent value="security" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <motion.div variants={itemFadeIn}>
              <GlassCard className="p-8 sm:p-12 space-y-12" hover={false}>
                <div className="space-y-4">
                  <h3 className="text-3xl font-black text-foreground tracking-tight">Security Core</h3>
                  <p className="font-bold text-muted-foreground opacity-70">Defensive measures protecting your financial sovereignty.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-8 rounded-[2rem] bg-indigo-600/5 border border-indigo-500/10 space-y-6">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center">
                      <Shield className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-foreground mb-2">Cryptographic Keys</h4>
                      <p className="text-sm font-bold text-muted-foreground opacity-70 leading-relaxed mb-6">Rotate your access credentials regularly to mitigate entropy risks.</p>
                      <Button variant="outline" className="rounded-xl border-indigo-500/20 hover:bg-indigo-600 hover:text-white font-black h-12 shadow-sm">
                        Initiate Rotation
                      </Button>
                    </div>
                  </div>

                  <div className="p-8 rounded-[2rem] bg-emerald-600/5 border border-emerald-500/10 space-y-6">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-foreground mb-2">Multi-Factor Protocol</h4>
                      <p className="text-sm font-bold text-muted-foreground opacity-70 leading-relaxed mb-6">Current standard: <span className="text-emerald-600">SECURE</span> via encrypted device signature.</p>
                      <Button variant="outline" className="rounded-xl border-emerald-500/20 hover:bg-emerald-600 hover:text-white font-black h-12 shadow-sm">
                        Configure MFA
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/10 dark:border-white/5">
                  <h4 className="text-[10px] uppercase font-black tracking-[0.3em] text-muted-foreground mb-6 opacity-50">Active Auth Sessions</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-5 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-white/20 dark:border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-blue-600/10 text-blue-600">
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-black text-foreground text-sm">Chrome Desktop (Current)</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Windows 11 • Lilongwe Hub • Active now</p>
                        </div>
                      </div>
                      <Badge className="bg-blue-600 text-white dark:bg-banana dark:text-blue-950 font-black px-3 py-1 rounded-lg">PRIMARY</Badge>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </TabsContent>

          <TabsContent value="payment" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <motion.div variants={itemFadeIn}>
              <GlassCard className="p-0 border-none overflow-hidden" hover={false}>
                <div className="h-2 bg-gradient-to-r from-emerald-400 via-teal-500 to-blue-500" />
                <CardHeader className="p-8 sm:p-10">
                  <CardTitle className="text-2xl font-black text-foreground">Liquidity Channels</CardTitle>
                  <CardDescription className="text-sm font-bold opacity-70 italic">
                    Manage your payment methods for receiving loan disbursements and making contributions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 sm:p-10 space-y-10">
                  {/* Member Bank Details Component */}
                  <MemberBankDetails />

                  <div className="bg-blue-600/5 border border-blue-500/10 rounded-2xl p-6 flex items-start gap-4">
                    <Shield className="w-6 h-6 text-blue-600 shrink-0 mt-1" />
                    <p className="text-xs font-bold text-muted-foreground leading-relaxed">
                      Secure Settlement: All payment data is encrypted and stored securely.
                      Transactions are processed via authorized bank gateways.
                    </p>
                  </div>
                </CardContent>
              </GlassCard>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  )
}
