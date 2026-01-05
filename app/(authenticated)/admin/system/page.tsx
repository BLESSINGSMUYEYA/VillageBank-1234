'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Users,
  Building2,
  DollarSign,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Shield,
  Settings,
  Activity,
  ArrowLeft
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
import { fadeIn, staggerContainer, itemFadeIn } from '@/lib/motions'
import { PageHeader } from '@/components/layout/PageHeader'

interface SystemData {
  totalUsers: number
  totalGroups: number
  totalContributions: number
  activeLoans: number
  pendingApprovals: number
  systemHealth: 'HEALTHY' | 'WARNING' | 'CRITICAL'
  databaseStatus: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE'
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

interface SystemData {
  totalUsers: number
  totalGroups: number
  totalContributions: number
  activeLoans: number
  pendingApprovals: number
  systemHealth: 'HEALTHY' | 'WARNING' | 'CRITICAL'
  databaseStatus: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE'
  recentActivities?: ActivityLog[]
  users?: UserData[]
  configurationHealth?: {
    cloudinary: boolean
    gemini: boolean
    database: boolean
    clerk: boolean
  }
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
        totalUsers: data.totalUsers,
        totalGroups: data.totalGroups,
        totalContributions: data.totalContributions,
        activeLoans: data.activeLoans,
        pendingApprovals: data.pendingApprovals,
        systemHealth: data.systemHealth,
        databaseStatus: data.databaseStatus,
        recentActivities: data.recentActivities,
        users: data.users,
        configurationHealth: data.configurationHealth
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
      // Reusing regional admin API for user updates for now, or create new endpoint
      // Assuming we extend standard admin API for this.
      // Or we can assume /api/admin/system doesn't handle POST yet.
      // Let's use /api/admin/regional for user updates as it handles "change_role" generically?
      // No, that endpoint is role-protected.
      // I should create a POST handler in /api/admin/system or assume one exists.
      // I'll assume I need to implement POST in /api/admin/system IF needed.
      // For now, let's just log or assume success for UI demo if API missing.
      // Actually, I should update API to handle POST.
      // But for this step I'll try calling /api/admin/regional? Wait, Super Admin can call that!
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
    // TODO: Implement database backup API
    console.log('Initiating database backup...')
  }

  const handleSystemMaintenance = async () => {
    // TODO: Implement system maintenance API
    console.log('Initiating system maintenance...')
  }

  if (user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to access this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading system data...</div>
      </div>
    )
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="max-w-7xl mx-auto py-6"
    >
      <motion.div variants={fadeIn} className="mb-8">
        <Link href="/dashboard" className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-blue-600 dark:hover:text-banana transition-all duration-300 group mb-4">
          <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
          Back to Hub
        </Link>
        <PageHeader
          title="System Administration"
          description="Manage the entire village banking system"
        />
      </motion.div>

      {/* System Status Alert */}
      <Alert className={`mb-6 ${data?.systemHealth === 'HEALTHY' ? 'border-green-200 bg-green-50' :
        data?.systemHealth === 'WARNING' ? 'border-yellow-200 bg-yellow-50' :
          'border-red-200 bg-red-50'
        }`}>
        <AlertTriangle className={`h-4 w-4 ${data?.systemHealth === 'HEALTHY' ? 'text-green-600' :
          data?.systemHealth === 'WARNING' ? 'text-yellow-600' :
            'text-red-600'
          }`} />
        <AlertDescription className={
          data?.systemHealth === 'HEALTHY' ? 'text-green-800' :
            data?.systemHealth === 'WARNING' ? 'text-yellow-800' :
              'text-red-800'
        }>
          System Status: {data?.systemHealth} • Database: {data?.databaseStatus}
        </AlertDescription>
      </Alert>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalUsers}</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalGroups}</div>
            <p className="text-xs text-muted-foreground">+5 new this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">MWK {(data?.totalContributions || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+22% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.activeLoans}</div>
            <p className="text-xs text-muted-foreground">15% approval rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{data?.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="regions">Regions</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Regional Performance</CardTitle>
                <CardDescription>
                  Compare performance across all regions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {regionalData.map((region) => (
                    <div key={region.region} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <h4 className="font-medium">{region.region} Region</h4>
                        <p className="text-sm text-gray-500">Admin: {region.admin}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">MWK {region.contributions.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">{region.groups} groups • {region.users} users</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>
                  Current system status and metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    <span>Database</span>
                  </div>
                  <Badge variant={data?.databaseStatus === 'ONLINE' ? 'default' : 'destructive'}>
                    {data?.databaseStatus}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    <span>API Response Time</span>
                  </div>
                  <span className="text-sm">124ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>Security</span>
                  </div>
                  <Badge variant="default">Secure</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Uptime</span>
                  </div>
                  <span className="text-sm">99.9%</span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <span className="text-xs font-bold uppercase text-muted-foreground mr-2">External Protocols</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-3 h-3" />
                    <span className="text-xs">Cloudinary (Receipts)</span>
                  </div>
                  <Badge variant={data?.configurationHealth?.cloudinary ? 'default' : 'destructive'} className="text-[8px] h-4">
                    {data?.configurationHealth?.cloudinary ? 'ONLINE' : 'OFFLINE'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-3 h-3" />
                    <span className="text-xs">Gemini AI (OCR Scan)</span>
                  </div>
                  <Badge variant={data?.configurationHealth?.gemini ? 'default' : 'destructive'} className="text-[8px] h-4">
                    {data?.configurationHealth?.gemini ? 'ONLINE' : 'OFFLINE'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-3 h-3" />
                    <span className="text-xs">Security (Clerk)</span>
                  </div>
                  <Badge variant={data?.configurationHealth?.clerk ? 'default' : 'destructive'} className="text-[8px] h-4">
                    {data?.configurationHealth?.clerk ? 'ONLINE' : 'OFFLINE'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="regions">
          <Card>
            <CardHeader>
              <CardTitle>Regional Management</CardTitle>
              <CardDescription>
                Manage regional administrators and settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {regionalData.map((region) => (
                  <div key={region.region} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{region.region} Region</h3>
                        <Badge variant="outline">Active</Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>Users: {region.users}</div>
                        <div>Groups: {region.groups}</div>
                        <div>Loans: {region.loans}</div>
                        <div>Admin: {region.admin}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/regional?region=${region.region.toLowerCase()}`)}
                      >
                        Manage
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/regional?region=${region.region.toLowerCase()}`)}
                      >
                        View Reports
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage all users and their permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Input placeholder="Search users by name or email..." className="max-w-sm" />
                </div>

                <div className="rounded-md border">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="p-4 font-medium">Name</th>
                        <th className="p-4 font-medium hidden md:table-cell">Contact</th>
                        <th className="p-4 font-medium hidden md:table-cell">Role</th>
                        <th className="p-4 font-medium hidden md:table-cell">Region</th>
                        <th className="p-4 font-medium hidden md:table-cell">Joined</th>
                        <th className="p-4 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(!data?.users || data.users.length === 0) ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-muted-foreground">
                            No users found.
                          </td>
                        </tr>
                      ) : (
                        data.users.map((user) => (
                          <tr key={user.id} className="border-b last:border-0 hover:bg-muted/50">
                            <td className="p-4">
                              <div className="font-medium">{user.name}</div>
                              <div className="text-xs text-muted-foreground md:hidden">{user.email}</div>
                            </td>
                            <td className="p-4 hidden md:table-cell">
                              <div className="text-xs">{user.email}</div>
                              {user.phoneNumber && <div className="text-xs text-muted-foreground">{user.phoneNumber}</div>}
                            </td>
                            <td className="p-4 hidden md:table-cell">
                              <Badge variant={user.role === 'MEMBER' ? 'secondary' : 'default'}>
                                {user.role.replace('_', ' ')}
                              </Badge>
                            </td>
                            <td className="p-4 hidden md:table-cell capitalize">
                              {user.region?.toLowerCase() || '-'}
                            </td>
                            <td className="p-4 hidden md:table-cell">
                              {new Date(user.joinedAt).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleManageUser(user)}
                              >
                                Manage
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Maintenance</CardTitle>
              <CardDescription>
                Perform system maintenance and backups
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Database Operations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button onClick={handleBackupDatabase} className="w-full">
                      <Database className="w-4 h-4 mr-2" />
                      Backup Database
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Settings className="w-4 h-4 mr-2" />
                      Database Maintenance
                    </Button>
                    <Button variant="outline" className="w-full">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      View Database Stats
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">System Operations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button onClick={handleSystemMaintenance} variant="outline" className="w-full">
                      <Settings className="w-4 h-4 mr-2" />
                      System Maintenance
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Shield className="w-4 h-4 mr-2" />
                      Security Audit
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Activity className="w-4 h-4 mr-2" />
                      Performance Monitor
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>System Activity Logs</CardTitle>
              <CardDescription>
                View system-wide activity and audit logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Select defaultValue="today">
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Activities</SelectItem>
                        <SelectItem value="auth">Authentication</SelectItem>
                        <SelectItem value="loans">Loans</SelectItem>
                        <SelectItem value="contributions">Contributions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => router.push('/admin/system/audit')}>
                    View Full History
                  </Button>
                </div>
                <div className="rounded-md border">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="p-4 font-medium">Time</th>
                        <th className="p-4 font-medium">User</th>
                        <th className="p-4 font-medium">Action</th>
                        <th className="p-4 font-medium">Description</th>
                        <th className="p-4 font-medium hidden md:table-cell">Group</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(!data?.recentActivities || data.recentActivities.length === 0) ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-muted-foreground">
                            No recent activity logs found.
                          </td>
                        </tr>
                      ) : (
                        data.recentActivities.map((log) => (
                          <tr key={log.id} className="border-b last:border-0 hover:bg-muted/50">
                            <td className="p-4 whitespace-nowrap text-gray-500">
                              {new Date(log.timestamp).toLocaleString()}
                            </td>
                            <td className="p-4 font-medium">{log.user}</td>
                            <td className="p-4">
                              <Badge variant="outline" className="font-mono text-xs">
                                {log.action}
                              </Badge>
                            </td>
                            <td className="p-4">{log.description}</td>
                            <td className="p-4 hidden md:table-cell text-gray-500">
                              {log.group || '-'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Management Dialog */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Manage User</DialogTitle>
            <DialogDescription>
              View details and manage access for {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-medium text-right text-sm">Name:</span>
                <span className="col-span-3 text-sm">{selectedUser.name}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-medium text-right text-sm">Email:</span>
                <span className="col-span-3 text-sm">{selectedUser.email}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-medium text-right text-sm">Current Role:</span>
                <span className="col-span-3 text-sm flex items-center gap-2">
                  <Badge variant={selectedUser.role === 'MEMBER' ? 'secondary' : 'default'}>
                    {selectedUser.role}
                  </Badge>
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-medium text-right text-sm">New Role:</span>
                <div className="col-span-3 flex gap-2">
                  <Select value={newRole} onValueChange={setNewRole}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MEMBER">MEMBER</SelectItem>
                      <SelectItem value="REGIONAL_ADMIN">REGIONAL ADMIN</SelectItem>
                      <SelectItem value="SUPER_ADMIN">SUPER ADMIN</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={handleChangeRole} disabled={newRole === selectedUser.role}>
                    Update
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
