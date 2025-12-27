'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
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
  Activity
} from 'lucide-react'

interface SystemData {
  totalUsers: number
  totalGroups: number
  totalContributions: number
  activeLoans: number
  pendingApprovals: number
  systemHealth: 'HEALTHY' | 'WARNING' | 'CRITICAL'
  databaseStatus: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE'
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
  const { user } = useAuth()
  const [data, setData] = useState<SystemData | null>(null)
  const [regionalData, setRegionalData] = useState<RegionalSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSystemData()
  }, [])

  const fetchSystemData = async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual API calls
      setData({
        totalUsers: 1247,
        totalGroups: 89,
        totalContributions: 15420000,
        activeLoans: 234,
        pendingApprovals: 23,
        systemHealth: 'HEALTHY',
        databaseStatus: 'ONLINE'
      })

      setRegionalData([
        {
          region: 'Northern',
          users: 312,
          groups: 23,
          contributions: 3840000,
          loans: 67,
          admin: 'John Banda'
        },
        {
          region: 'Central',
          users: 567,
          groups: 41,
          contributions: 7230000,
          loans: 98,
          admin: 'Mary Phiri'
        },
        {
          region: 'Southern',
          users: 368,
          groups: 25,
          contributions: 4350000,
          loans: 69,
          admin: 'Joseph Mwale'
        }
      ])
    } catch (error) {
      console.error('Failed to fetch system data:', error)
    } finally {
      setLoading(false)
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
    <div className="max-w-7xl mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">System Administration</h1>
        <p className="text-gray-600">Manage the entire village banking system</p>
      </div>

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
                      <Button variant="outline" size="sm">Manage</Button>
                      <Button variant="outline" size="sm">View Reports</Button>
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
                  <Input placeholder="Search users..." className="max-w-sm" />
                  <Select defaultValue="all">
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="member">Members</SelectItem>
                      <SelectItem value="regional_admin">Regional Admins</SelectItem>
                      <SelectItem value="super_admin">Super Admins</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button>Add User</Button>
                </div>
                <div className="text-center py-8 text-gray-500">
                  User management interface coming soon...
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
                <div className="text-center py-8 text-gray-500">
                  Activity logs interface coming soon...
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
