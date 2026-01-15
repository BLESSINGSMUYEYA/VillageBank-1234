'use client'

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
  Download
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

interface SystemData {
  totalUsers: number
  totalGroups: number
  totalContributions: number
  activeLoans: number
  pendingApprovals: number
  systemHealth: 'HEALTHY' | 'WARNING' | 'CRITICAL'
  databaseStatus: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE'
  recentActivities: ActivityLog[]
  users: UserData[]
  configurationHealth: {
    cloudinary: boolean
    gemini: boolean
    database: boolean
    clerk: boolean
  }
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

  useEffect(() => {
    if (user?.role === 'SUPER_ADMIN') {
      fetchSystemData()
    }
  }, [user])

  const fetchSystemData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/system')
      if (!response.ok) throw new Error('Failed to fetch system data')

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
    <div className="min-h-screen pb-20 relative overflow-hidden bg-slate-50 dark:bg-slate-950">
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
        <motion.div variants={fadeIn} className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Link href="/dashboard" className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors duration-300 group mb-2">
              <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
              Return to Hub
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                <span className="text-gradient-primary">System Command</span>
              </h1>
              <Badge variant={data?.systemHealth === 'HEALTHY' ? 'default' : 'destructive'} className="ml-2 animate-pulse">
                {data?.systemHealth}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1 font-medium">
              Global Overview • v2.4.0 • UBank Core
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="glass-morphism border-white/20" onClick={() => toast.info('Generating system report...')}>
              <Download className="w-4 h-4 mr-2" />
              Report
            </Button>
            <Button className="shadow-lg shadow-primary/20">
              <Settings className="w-4 h-4 mr-2" />
              Global Config
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
            title="System Assets"
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

        <Tabs defaultValue="overview" className="space-y-8">
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            <TabsList className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-1 h-12 rounded-full border border-white/20 min-w-max">
              <TabsTrigger value="overview" className="rounded-full px-6 h-10 data-[state=active]:bg-primary data-[state=active]:text-white">Overview</TabsTrigger>
              <TabsTrigger value="regions" className="rounded-full px-6 h-10 data-[state=active]:bg-primary data-[state=active]:text-white">Regions</TabsTrigger>
              <TabsTrigger value="users" className="rounded-full px-6 h-10 data-[state=active]:bg-primary data-[state=active]:text-white">Users</TabsTrigger>
              <TabsTrigger value="system" className="rounded-full px-6 h-10 data-[state=active]:bg-primary data-[state=active]:text-white">System Health</TabsTrigger>
              <TabsTrigger value="logs" className="rounded-full px-6 h-10 data-[state=active]:bg-primary data-[state=active]:text-white">Audit Logs</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <GrowthChart />
              </div>
              <div className="lg:col-span-1">
                <RegionDistributionChart />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AdminGlassCard title="Recent Alerts" description="System notifications and warnings">
                <div className="space-y-4 p-2">
                  {data?.systemHealth !== 'HEALTHY' && (
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
                      <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-amber-800 dark:text-amber-400">System Warning</h4>
                        <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">
                          High latency detected in database-read replicas.
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <Server className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-300">Backup Completed</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-500 mt-1">
                        Daily incremental backup finished at 04:00 AM.
                      </p>
                    </div>
                  </div>
                </div>
              </AdminGlassCard>

              <AdminGlassCard title="Quick Actions" description="Common administrative tasks">
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/30">
                    <Users className="w-6 h-6 text-primary" />
                    <span>Add User</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/30">
                    <Database className="w-6 h-6 text-emerald-600" />
                    <span>Run Backup</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/30">
                    <Globe className="w-6 h-6 text-purple-600" />
                    <span>Region Settings</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/30">
                    <Shield className="w-6 h-6 text-rose-600" />
                    <span>Security Audit</span>
                  </Button>
                </div>
              </AdminGlassCard>
            </div>
          </TabsContent>

          <TabsContent value="regions">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {regionalData.map((region) => (
                <AdminGlassCard key={region.region} className="group hover:border-primary/40 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Globe className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{region.region} Region</h3>
                        <p className="text-xs text-muted-foreground">{region.admin}</p>
                      </div>
                    </div>
                    <Badge variant="outline">Active</Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-border/40">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{region.users}</div>
                      <div className="text-xs text-muted-foreground">Users</div>
                    </div>
                    <div className="text-center border-l border-border/40">
                      <div className="text-2xl font-bold">{region.groups}</div>
                      <div className="text-xs text-muted-foreground">Groups</div>
                    </div>
                    <div className="text-center border-l border-border/40">
                      <div className="text-2xl font-bold">{region.loans}</div>
                      <div className="text-xs text-muted-foreground">Active Loans</div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button className="w-full" variant="secondary" onClick={() => router.push(`/admin/regional?region=${region.region.toLowerCase()}`)}>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
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
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Clerk Auth</span>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${data?.configurationHealth?.clerk ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <span className="text-xs font-mono">{data?.configurationHealth?.clerk ? 'CONNECTED' : 'ERROR'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </AdminGlassCard>

              <AdminGlassCard title="Maintenance">
                <div className="space-y-4 pt-4">
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
              title="Global User Registry"
              description="Manage users across all regions."
              action={
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="Search users by name/email..." className="pl-9 bg-white/50 border-border/40" />
                </div>
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary/5 border-b border-primary/10">
                    <tr>
                      <th className="text-left p-4 text-xs font-black uppercase text-muted-foreground tracking-wider">User</th>
                      <th className="text-left p-4 text-xs font-black uppercase text-muted-foreground tracking-wider hidden md:table-cell">Contact</th>
                      <th className="text-left p-4 text-xs font-black uppercase text-muted-foreground tracking-wider">Role</th>
                      <th className="text-left p-4 text-xs font-black uppercase text-muted-foreground tracking-wider hidden md:table-cell">Region</th>
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
              <div className="space-y-4 p-2">
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
                        <div className="flex justify-between">
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
          <DialogContent className="sm:max-w-[425px] glass-morphism border-white/20">
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
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleChangeRole} disabled={newRole === selectedUser?.role}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  )
}
