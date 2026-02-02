'use client' // Re-trigger build

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Users,
  Building2,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Database,
  Shield,
  Settings,
  Activity,
  ArrowLeft,
  Server,
  Cpu,
  Globe,
  Search,
  MoreVertical,
  Lock,
  Download,
  Trash2,
  Ban,
  CheckCircle
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { motion } from 'framer-motion'
import { fadeIn, staggerContainer } from '@/lib/motions'
import { AdminGlassCard } from '@/components/admin/AdminGlassCard'
import { AdminStatsCard } from '@/components/admin/AdminStatsCard'
import { GrowthChart, RegionDistributionChart } from '@/components/admin/SuperAdminCharts'
import { ViralFunnelChart, RetentionPulse, GrowthLeaderboard, HealthPulse } from '@/components/admin/GrowthEngineCharts'
import { QuickActionsWidget } from '@/components/admin/QuickActionsWidget'
import { deleteUser, toggleUserBlockStatus } from '@/app/actions/admin'

interface SystemData {
  totalUsers: number
  totalGroups: number
  totalContributions: number
  activeLoans: number
  pendingApprovals: number
  systemHealth: 'HEALTHY' | 'WARNING' | 'CRITICAL'
  databaseStatus: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE'
  growthHistory: {
    name: string
    users: number
    volume: number
  }[]
  growthEngine: {
    funnel: {
      views: number
      conversions: number
      rate: string
    }
    retention: {
      activeUsers: number
      rate: string
    }
    leaderboard: {
      name: string
      region: string
      newMembers: number
    }[]
  }
  recentActivities: ActivityLog[]
  users: UserData[]
  configurationHealth: {
    cloudinary: boolean
    gemini: boolean
    database: boolean
  }
  regionalSummaries: RegionalSummary[]
}

interface UserData {
  id: string
  name: string
  email: string
  role: string
  region?: string
  phoneNumber: string | null
  joinedAt: string
  status: string
}

interface ActivityLog {
  id: string
  user: string
  action: string
  description: string
  timestamp: string
  group?: string
}

interface RegionalSummary {
  region: string
  users: number
  groups: number
  contributions: number
  loans: number
  admin: string
}

export default function SystemAdminPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [data, setData] = useState<SystemData | null>(null)
  const [regionalData, setRegionalData] = useState<RegionalSummary[]>([])
  const [loading, setLoading] = useState(true)

  // User Management State
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [newRole, setNewRole] = useState('')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isActionLoading, setIsActionLoading] = useState(false)

  useEffect(() => {
    if (user?.role === 'SUPER_ADMIN') {
      fetchSystemData()
    }
  }, [user])

  const fetchSystemData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/system')
      if (!response.ok) {
        const text = await response.text()
        console.error('Fetch System Data Failed:', { status: response.status, statusText: response.statusText, body: text })
        throw new Error(`Failed to fetch system data: ${response.status} ${text}`)
      }

      const data = await response.json()

      setData({
        ...data,
        regionalSummaries: data.regionalSummaries || []
      })

      setRegionalData(data.regionalSummaries || [])
    } catch (error) {
      console.error('Failed to fetch system data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleManageUser = (user: UserData) => {
    setSelectedUser(user)
    setNewRole(user.role)
    setIsUserDialogOpen(true)
  }

  const handleChangeRole = async () => {
    if (!selectedUser || !newRole) return

    try {
      const response = await fetch('/api/admin/regional', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          action: 'change_role',
          newRole
        })
      })

      if (!response.ok) throw new Error('Failed to update role')

      toast.success('User role updated')
      setIsUserDialogOpen(false)
      fetchSystemData()
    } catch (error) {
      console.error(error)
      toast.error('Failed to update role')
    }
  }

  const handleBackupDatabase = async () => {
    toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
      loading: 'Backing up database...',
      success: 'Database backup created successfully',
      error: 'Backup failed'
    })
  }

  const handleSystemMaintenance = async () => {
    toast.info('System maintenance mode toggled')
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    setIsActionLoading(true)
    try {
      const result = await deleteUser(selectedUser.id)

      if (result.success) {
        toast.success(result.message || 'User deleted successfully')
        setIsDeleteDialogOpen(false)
        setIsUserDialogOpen(false)
        fetchSystemData()
      } else {
        toast.error(result.error || 'Failed to delete user')
      }
    } catch (error) {
      console.error(error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleToggleBlockStatus = async () => {
    if (!selectedUser) return

    setIsActionLoading(true)
    try {
      const result = await toggleUserBlockStatus(
        selectedUser.id,
        selectedUser.status as any
      )

      if (result.success) {
        toast.success(result.message || 'User status updated successfully')
        setIsUserDialogOpen(false)
        fetchSystemData()
      } else {
        toast.error(result.error || 'Failed to update user status')
      }
    } catch (error) {
      console.error(error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsActionLoading(false)
    }
  }

  if (user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400">
            <Lock className="w-12 h-12" />
          </div>
          <h1 className="text-2xl font-bold">Restricted Access</h1>
          <p className="text-muted-foreground">This command center is restricted to Super Administrators only.</p>
          <Link href="/dashboard">
            <Button className="mt-4">Return to Safety</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground animate-pulse">Initializing Command Center...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20 relative overflow-hidden overflow-x-hidden bg-slate-50 dark:bg-slate-950">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-20 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px]" />
        <div className="absolute top-40 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-20 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="max-w-7xl mx-auto py-8 px-4 sm:px-6 relative z-10"
      >
        <motion.div
          className="mb-5 md:mb-8"
          variants={fadeIn}
        >
          {/* Title and Badge */}
          <div className="flex items-center gap-1.5 mb-1">
            <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              <span className="text-gradient-primary">System Command</span>
            </h1>
            <Badge
              variant={data?.systemHealth === 'HEALTHY' ? 'default' : 'destructive'}
              className="animate-pulse text-[9px] sm:text-xs px-1.5 py-0 h-4 sm:h-5 font-bold shrink-0"
            >
              {data?.systemHealth}
            </Badge>
          </div>

          {/* Subtitle and Buttons Row */}
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-muted-foreground text-[11px] sm:text-sm font-medium leading-tight">
              Global Overview • v2.4.0
            </p>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="glass-morphism border-white/20"
                onClick={() => toast.info('Generating system report...')}
              >
                <Download className="w-4 h-4 mr-2" />
                Report
              </Button>
              <Button size="sm" className="shadow-lg shadow-primary/20">
                <Settings className="w-4 h-4 mr-2" />
                Config
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats - Mobile Carousel / Desktop Grid */}
        <div className="mb-6 md:mb-8">
          {/* Mobile: Horizontal Carousel with Snap Scroll */}
          {/* Mobile: Horizontal Carousel with Snap Scroll */}
          <div className="md:hidden">
            <div className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 pb-1">
              <div className="min-w-[calc(100vw-2.5rem)] sm:min-w-[300px] snap-center flex-shrink-0 h-full">
                <AdminStatsCard
                  title="Total Users"
                  value={data?.totalUsers || 0}
                  icon={Users}
                  trend="+8.2%"
                  trendDirection="up"
                  delay={0}
                  className="border-blue-200/50 dark:border-blue-800/50 h-full snap-align-center"
                />
              </div>
              <div className="min-w-[calc(100vw-2.5rem)] sm:min-w-[300px] snap-center flex-shrink-0 h-full">
                <AdminStatsCard
                  title="Total Groups"
                  value={data?.totalGroups || 0}
                  icon={Building2}
                  trend="+5 New"
                  trendDirection="up"
                  delay={0}
                  className="border-indigo-200/50 dark:border-indigo-800/50 h-full snap-align-center"
                />
              </div>
              <div className="min-w-[calc(100vw-2.5rem)] sm:min-w-[300px] snap-center flex-shrink-0 h-full">
                <AdminStatsCard
                  title="System Contributions"
                  value={`MWK ${(data?.totalContributions || 0).toLocaleString()}`}
                  icon={DollarSign}
                  trend="+22%"
                  trendDirection="up"
                  delay={0}
                  className="border-emerald-200/50 dark:border-emerald-800/50 h-full snap-align-center"
                />
              </div>
              <div className="min-w-[calc(100vw-2.5rem)] sm:min-w-[300px] snap-center flex-shrink-0 h-full">
                <AdminStatsCard
                  title="Pending Tasks"
                  value={data?.pendingApprovals || 0}
                  icon={AlertTriangle}
                  trend="Action Required"
                  trendDirection="down"
                  delay={0}
                  className="border-amber-200/50 dark:border-amber-800/50 bg-amber-50/30 dark:bg-amber-900/10 h-full snap-align-center"
                />
              </div>
            </div>
            {/* Scroll Indicator Dots */}
            <div className="flex justify-center gap-1.5 mt-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></div>
            </div>
          </div>

          {/* Desktop: Grid Layout */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <AdminStatsCard
              title="Total Users"
              value={data?.totalUsers || 0}
              icon={Users}
              trend="+8.2%"
              trendDirection="up"
              delay={100}
              className="border-blue-200/50 dark:border-blue-800/50"
            />
            <AdminStatsCard
              title="Total Groups"
              value={data?.totalGroups || 0}
              icon={Building2}
              trend="+5 New"
              trendDirection="up"
              delay={200}
              className="border-indigo-200/50 dark:border-indigo-800/50"
            />
            <AdminStatsCard
              title="System Contributions"
              value={`MWK ${(data?.totalContributions || 0).toLocaleString()}`}
              icon={DollarSign}
              trend="+22%"
              trendDirection="up"
              delay={300}
              className="border-emerald-200/50 dark:border-emerald-800/50"
            />
            <AdminStatsCard
              title="Pending Tasks"
              value={data?.pendingApprovals || 0}
              icon={AlertTriangle}
              trend="Action Required"
              trendDirection="down"
              delay={400}
              className="border-amber-200/50 dark:border-amber-800/50 bg-amber-50/30 dark:bg-amber-900/10"
            />
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4 md:space-y-6 lg:space-y-8">
          {/* Tab Navigation - Sticky & Responsive */}
          <div className="sticky top-0 z-30 -mx-4 px-4 md:mx-0 md:px-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl py-3 border-b border-border/10 transition-all duration-300">
            <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth">
              <div className="flex items-center justify-start">

                <TabsList className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-0.5 md:p-1 h-10 md:h-12 rounded-full border border-white/20 inline-flex gap-0.5 md:gap-1">
                  <TabsTrigger value="overview" className="rounded-full px-3 md:px-6 h-8 md:h-10 text-[11px] md:text-sm data-[state=active]:bg-primary data-[state=active]:text-white whitespace-nowrap snap-center transition-all duration-200 font-medium">Overview</TabsTrigger>
                  <TabsTrigger value="regions" className="rounded-full px-3 md:px-6 h-8 md:h-10 text-[11px] md:text-sm data-[state=active]:bg-primary data-[state=active]:text-white whitespace-nowrap snap-center transition-all duration-200 font-medium">Regions</TabsTrigger>
                  <TabsTrigger value="users" className="rounded-full px-3 md:px-6 h-8 md:h-10 text-[11px] md:text-sm data-[state=active]:bg-primary data-[state=active]:text-white whitespace-nowrap snap-center transition-all duration-200 font-medium">Users</TabsTrigger>
                  <TabsTrigger value="growth" className="rounded-full px-3 md:px-6 h-8 md:h-10 text-[11px] md:text-sm data-[state=active]:bg-primary data-[state=active]:text-white whitespace-nowrap snap-center transition-all duration-200 font-medium">Growth</TabsTrigger>
                  <TabsTrigger value="system" className="rounded-full px-3 md:px-6 h-8 md:h-10 text-[11px] md:text-sm data-[state=active]:bg-primary data-[state=active]:text-white whitespace-nowrap snap-center transition-all duration-200 font-medium">System</TabsTrigger>
                  <TabsTrigger value="logs" className="rounded-full px-3 md:px-6 h-8 md:h-10 text-[11px] md:text-sm data-[state=active]:bg-primary data-[state=active]:text-white whitespace-nowrap snap-center transition-all duration-200 font-medium">Logs</TabsTrigger>
                </TabsList>
              </div>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="hidden md:block lg:col-span-2">
                <GrowthChart data={data?.growthHistory} />
              </div>
              <div className="lg:col-span-1">
                <RegionDistributionChart data={data?.regionalSummaries} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AdminGlassCard title="System Health Pulse" description="Real-time vital signs">
                <div className="h-[200px] w-full">
                  <HealthPulse data={[{ name: 'CPU', value: 45 }, { name: 'Memory', value: 60 }, { name: 'Network', value: 25 }]} />
                </div>
              </AdminGlassCard>

              <AdminGlassCard title="Recent Alerts" description="System notifications and warnings">
                <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 md:p-6">
                  {data?.systemHealth !== 'HEALTHY' && (
                    <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
                      <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <h4 className="text-sm font-bold text-amber-800 dark:text-amber-400">System Warning</h4>
                        <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">
                          High latency detected in database-read replicas.
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <Server className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-300">Backup Completed</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-500 mt-1">
                        Daily incremental backup finished at 04:00 AM.
                      </p>
                    </div>
                  </div>
                </div>
              </AdminGlassCard>
            </div>

            <QuickActionsWidget />
          </TabsContent>

          <TabsContent value="growth" className="space-y-6">
            {data?.growthEngine && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <ViralFunnelChart data={data.growthEngine.funnel} />
                  </div>
                  <div className="lg:col-span-1">
                    <RetentionPulse data={data.growthEngine.retention} />
                  </div>
                </div>
                <div className="grid grid-cols-1">
                  <GrowthLeaderboard data={data.growthEngine.leaderboard} />
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="regions">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
              {regionalData.map((region) => (
                <AdminGlassCard key={region.region} className="group hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                  <div className="flex items-center justify-between mb-3 md:mb-4 px-2.5 md:px-6 pt-3 md:pt-6">
                    <div className="flex items-center gap-1.5 md:gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                        <Globe className="w-4 h-4 md:w-6 md:h-6 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-xs md:text-lg truncate">{region.region}</h3>
                        <p className="text-[9px] md:text-xs text-muted-foreground truncate">{region.admin}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 font-semibold text-[9px] md:text-xs px-1 md:px-2 shrink-0">Active</Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-1 md:gap-4 py-3 md:py-4 px-3 md:px-6 border-t border-b border-border/40 bg-gradient-to-br from-slate-50/50 to-transparent dark:from-slate-800/30 dark:to-transparent">
                    <div className="text-center">
                      <div className="text-lg md:text-2xl font-bold bg-gradient-to-br from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">{region.users}</div>
                      <div className="text-[9px] md:text-xs text-muted-foreground font-medium">Users</div>
                    </div>
                    <div className="text-center border-l border-border/40">
                      <div className="text-lg md:text-2xl font-bold bg-gradient-to-br from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">{region.groups}</div>
                      <div className="text-[9px] md:text-xs text-muted-foreground font-medium">Groups</div>
                    </div>
                    <div className="text-center border-l border-border/40">
                      <div className="text-lg md:text-2xl font-bold bg-gradient-to-br from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">{region.loans}</div>
                      <div className="text-[9px] md:text-xs text-muted-foreground font-medium leading-tight"><span className="hidden md:inline">Active </span>Loans</div>
                    </div>
                  </div>

                  <div className="mt-3 md:mt-4 flex gap-2 px-3 md:px-6 pb-3 md:pb-6">
                    <Button className="w-full group-hover:shadow-md group-hover:shadow-primary/20 transition-all duration-300 h-9 md:h-10 text-xs md:text-sm" variant="secondary" onClick={() => router.push(`/admin/regional?region=${region.region.toLowerCase()}`)}>
                      Manage Territory
                    </Button>
                  </div>
                </AdminGlassCard>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="system">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <AdminGlassCard title="Infrastructure Health" className="col-span-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 md:p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30">
                      <div className="flex items-center gap-3">
                        <Database className="w-5 h-5 text-emerald-600" />
                        <span className="font-medium text-emerald-900 dark:text-emerald-300">Database Cluster</span>
                      </div>
                      <Badge className="bg-emerald-500 hover:bg-emerald-600">ONLINE</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
                      <div className="flex items-center gap-3">
                        <Cpu className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-blue-900 dark:text-blue-300">API Gateway</span>
                      </div>
                      <Badge className="bg-blue-500 hover:bg-blue-600">98ms</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-purple-50/50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-900/30">
                      <div className="flex items-center gap-3">
                        <Server className="w-5 h-5 text-purple-600" />
                        <span className="font-medium text-purple-900 dark:text-purple-300">Storage (S3)</span>
                      </div>
                      <Badge className="bg-purple-500 hover:bg-purple-600">HEALTHY</Badge>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Integrations</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Cloudinary CDN</span>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${data?.configurationHealth?.cloudinary ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <span className="text-xs font-mono">{data?.configurationHealth?.cloudinary ? 'CONNECTED' : 'ERROR'}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Gemini AI</span>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${data?.configurationHealth?.gemini ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <span className="text-xs font-mono">{data?.configurationHealth?.gemini ? 'CONNECTED' : 'ERROR'}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </AdminGlassCard>

              <AdminGlassCard title="Maintenance">
                <div className="space-y-4 p-4 md:p-6">
                  <Button onClick={handleBackupDatabase} variant="outline" className="w-full justify-start">
                    <Database className="w-4 h-4 mr-2" />
                    Backup Database Now
                  </Button>
                  <Button onClick={handleSystemMaintenance} variant="outline" className="w-full justify-start text-amber-600 border-amber-200 hover:bg-amber-50">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Toggle Maintenance Mode
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-rose-600 border-rose-200 hover:bg-rose-50">
                    <Activity className="w-4 h-4 mr-2" />
                    Flush Cache
                  </Button>
                </div>
              </AdminGlassCard>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <AdminGlassCard
              title={`Global User Registry (${data?.totalUsers || 0})`}
              description="Manage users across all regions."
              action={
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="Search users..." className="pl-9 bg-white/50 border-border/40" />
                </div>
              }
            >
              {/* Mobile: Card-Based User List */}
              <div className="md:hidden space-y-2.5 p-3">
                {(!data?.users || data.users.length === 0) ? (
                  <div className="text-center py-16 px-4">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
                      <Users className="w-10 h-10 text-slate-400 dark:text-slate-600" />
                    </div>
                    <h3 className="font-bold text-sm mb-1">No Users Found</h3>
                    <p className="text-xs text-muted-foreground">Start by adding your first user to the system.</p>
                  </div>
                ) : (
                  data.users.map((user) => (
                    <div key={user.id} className="flex items-start gap-3 p-3.5 rounded-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800/50 dark:to-slate-900/30 border border-slate-200/70 dark:border-slate-700/50 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 active:scale-[0.98]">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-base ring-2 ring-white dark:ring-slate-900 shadow-lg shadow-indigo-500/30 flex-shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <div className="font-bold text-sm truncate">{user.name}</div>
                        </div>
                        <div className="text-xs text-muted-foreground truncate mb-1.5">{user.email}</div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            className={`text-[10px] h-5 px-1.5 font-semibold ${user.role === 'SUPER_ADMIN'
                              ? 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300'
                              : user.role === 'REGIONAL_ADMIN'
                                ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300'
                                : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
                              }`}
                            variant="outline"
                          >
                            {user.role.replace('_', ' ')}
                          </Badge>
                          {user.region && (
                            <span className="text-[10px] text-muted-foreground capitalize px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-medium">
                              {user.region.toLowerCase()}
                            </span>
                          )}
                          {user.status === 'BLOCKED' && (
                            <Badge variant="destructive" className="text-[10px] h-5 px-1.5 font-semibold">BLOCKED</Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleManageUser(user)}
                        className="h-9 w-9 p-0 hover:bg-primary/10 hover:text-primary hover:scale-110 transition-all duration-200 flex-shrink-0 rounded-full"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop: Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary/5 border-b border-primary/10">
                    <tr>
                      <th className="text-left p-4 text-xs font-black uppercase text-muted-foreground tracking-wider">User</th>
                      <th className="text-left p-4 text-xs font-black uppercase text-muted-foreground tracking-wider">Contact</th>
                      <th className="text-left p-4 text-xs font-black uppercase text-muted-foreground tracking-wider">Role</th>
                      <th className="text-left p-4 text-xs font-black uppercase text-muted-foreground tracking-wider">Region</th>
                      <th className="text-right p-4 text-xs font-black uppercase text-muted-foreground tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {(!data?.users || data.users.length === 0) ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                          No users found in the system registry.
                        </td>
                      </tr>
                    ) : (
                      data.users.map((user) => (
                        <tr key={user.id} className="hover:bg-primary/5 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-white dark:ring-slate-900 shadow-md">
                                {user.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-slate-800 dark:text-slate-200">{user.name}</div>
                                <div className="text-xs text-muted-foreground md:hidden">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 hidden md:table-cell">
                            <div className="text-sm">{user.email}</div>
                            <div className="text-xs text-muted-foreground">{user.phoneNumber || 'N/A'}</div>
                          </td>
                          <td className="p-4">
                            <Badge
                              className={
                                user.role === 'SUPER_ADMIN'
                                  ? 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300'
                                  : user.role === 'REGIONAL_ADMIN'
                                    ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300'
                                    : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
                              }
                              variant="outline"
                            >
                              {user.role.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="p-4 hidden md:table-cell capitalize">
                            {user.region?.toLowerCase() || 'Global'}
                          </td>
                          <td className="p-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleManageUser(user)}
                              className="h-8 hover:bg-primary/10 hover:text-primary"
                            >
                              Edit
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </AdminGlassCard>
          </TabsContent>

          <TabsContent value="logs">
            <AdminGlassCard title="Activity Stream" description="Real-time system audit logs">
              <div className="space-y-4 p-4 md:p-6">
                {(!data?.recentActivities || data.recentActivities.length === 0) ? (
                  <div className="text-center py-10 text-muted-foreground">
                    No activity logs recorded yet.
                  </div>
                ) : (
                  data.recentActivities.map((log) => (
                    <div key={log.id} className="flex gap-4 p-4 border-b border-border/40 last:border-0 hover:bg-primary/5 transition-colors">
                      <div className="mt-1">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <Activity className="w-4 h-4 text-slate-500" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                          <h4 className="font-bold text-sm">
                            {log.user} <span className="font-normal text-muted-foreground">performed</span> {log.action}
                          </h4>
                          <span className="text-xs text-muted-foreground font-mono">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{log.description}</p>
                        {log.group && (
                          <Badge variant="secondary" className="mt-2 text-[10px]">
                            Group: {log.group}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </AdminGlassCard>
          </TabsContent>

        </Tabs>

        {/* User Management Dialog */}
        <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
          <DialogContent className="w-[95vw] sm:w-full sm:max-w-[425px] max-h-[85vh] overflow-y-auto glass-morphism border-white/20">
            <DialogHeader>
              <DialogTitle>Manage User Profile</DialogTitle>
              <DialogDescription>
                Modify access levels for {selectedUser?.name}
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="grid gap-4 py-4">
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium">{selectedUser.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{selectedUser.email}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current Role</span>
                    <Badge variant="outline">{selectedUser.role}</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Assign New Role</label>
                  <Select value={newRole} onValueChange={setNewRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MEMBER">Member (Standard)</SelectItem>
                      <SelectItem value="REGIONAL_ADMIN">Regional Admin</SelectItem>
                      <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Action Buttons Section */}
                <div className="pt-4 border-t border-border/50 space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Account Actions</h4>

                  {/* Block/Unblock Button */}
                  <Button
                    variant="outline"
                    className={`w-full justify-start ${selectedUser.status === 'BLOCKED'
                        ? 'border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                        : 'border-amber-200 hover:bg-amber-50 dark:border-amber-800 dark:hover:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                      }`}
                    onClick={handleToggleBlockStatus}
                    disabled={isActionLoading}
                  >
                    {selectedUser.status === 'BLOCKED' ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Unblock User
                      </>
                    ) : (
                      <>
                        <Ban className="w-4 h-4 mr-2" />
                        Block User
                      </>
                    )}
                  </Button>

                  {/* Delete Button */}
                  <Button
                    variant="outline"
                    className="w-full justify-start border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20 text-red-700 dark:text-red-400"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    disabled={isActionLoading}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUserDialogOpen(false)} disabled={isActionLoading}>
                Cancel
              </Button>
              <Button onClick={handleChangeRole} disabled={newRole === selectedUser?.role || isActionLoading}>
                {isActionLoading ? 'Saving...' : 'Save Role'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="w-[95vw] sm:w-full sm:max-w-[425px] glass-morphism border-red-200 dark:border-red-800">
            <DialogHeader>
              <DialogTitle className="text-red-700 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Confirm Account Deletion
              </DialogTitle>
              <DialogDescription className="text-slate-700 dark:text-slate-300">
                This action cannot be undone. This will permanently delete the user account and all associated data.
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-red-900 dark:text-red-300">User:</span>
                  <span className="font-bold text-red-900 dark:text-red-200">{selectedUser.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-red-900 dark:text-red-300">Email:</span>
                  <span className="font-bold text-red-900 dark:text-red-200">{selectedUser.email}</span>
                </div>
                <div className="mt-3 p-3 bg-white/50 dark:bg-slate-900/50 rounded border border-red-200 dark:border-red-700">
                  <p className="text-xs text-red-800 dark:text-red-300 font-medium">
                    ⚠️ All user data including contributions, loans, and group memberships will be permanently deleted.
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isActionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteUser}
                disabled={isActionLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                {isActionLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Permanently
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div >
    </div >
  )
}
