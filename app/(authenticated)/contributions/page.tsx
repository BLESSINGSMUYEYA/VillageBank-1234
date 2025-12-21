import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Calendar, DollarSign, TrendingUp, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function ContributionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; groupId?: string; month?: string; year?: string; search?: string }>
}) {
  const { userId } = await auth()
  const params = await searchParams
  
  if (!userId) {
    return <div>Please sign in to access contributions.</div>
  }

  // Build query parameters for API call
  const queryParams = new URLSearchParams()
  if (params.status) queryParams.set('status', params.status)
  if (params.groupId) queryParams.set('groupId', params.groupId)
  if (params.month && params.year) {
    queryParams.set('month', params.month)
    queryParams.set('year', params.year)
  }
  if (params.search) queryParams.set('search', params.search)

  // Get user's contributions with filters using direct Prisma call
  const whereClause: any = {
    userId: userId,
  }

  if (params.status) {
    whereClause.status = params.status
  }

  if (params.groupId) {
    whereClause.groupId = params.groupId
  }

  if (params.month && params.year) {
    whereClause.month = parseInt(params.month)
    whereClause.year = parseInt(params.year)
  }

  const contributions = await prisma.contribution.findMany({
    where: whereClause,
    include: {
      group: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // If search term provided, filter by group name
  let filteredContributions = contributions
  if (params.search) {
    const searchTerm = params.search.toLowerCase()
    filteredContributions = contributions.filter(contribution =>
      contribution.group.name.toLowerCase().includes(searchTerm) ||
      contribution.group.region.toLowerCase().includes(searchTerm)
    )
  }

  // Get user's groups for making new contributions and filter dropdown
  const userGroups = await prisma.groupMember.findMany({
    where: {
      userId: userId,
      status: 'ACTIVE',
    },
    include: {
      group: true,
    },
  })

  // Calculate stats
  const completedContributions = filteredContributions.filter(c => c.status === 'COMPLETED')
  const pendingContributions = filteredContributions.filter(c => c.status === 'PENDING')
  const totalContributed = completedContributions.reduce((sum, c) => sum + Number(c.amount), 0)
  
  // Check for current month contributions
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()
  const currentMonthContributions = filteredContributions.filter(
    c => c.month === currentMonth && c.year === currentYear
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Contributions</h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage your monthly contributions</p>
        </div>
        {userGroups.length > 0 && (
          <Link href="/contributions/new">
            <Button className="w-full sm:w-auto rounded-2xl font-bold">
              <Plus className="w-4 h-4 mr-2" />
              Make Contribution
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card className="border-none shadow-lg bg-white/40 dark:bg-gray-900/40 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl font-black flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search groups..."
                className="pl-10"
                defaultValue={params.search || ''}
              />
            </div>

            {/* Status Filter */}
            <Select defaultValue={params.status || ''}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>

            {/* Group Filter */}
            <Select defaultValue={params.groupId || ''}>
              <SelectTrigger>
                <SelectValue placeholder="All Groups" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Groups</SelectItem>
                {userGroups.map((groupMember) => (
                  <SelectItem key={groupMember.groupId} value={groupMember.groupId}>
                    {groupMember.group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Month/Year Filter */}
            <Select defaultValue={params.month && params.year ? `${params.month}-${params.year}` : ''}>
              <SelectTrigger>
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Time</SelectItem>
                {/* Generate last 12 months */}
                {Array.from({ length: 12 }, (_, i) => {
                  const date = new Date()
                  date.setMonth(date.getMonth() - i)
                  const month = (date.getMonth() + 1).toString().padStart(2, '0')
                  const year = date.getFullYear().toString()
                  const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                  return (
                    <SelectItem key={`${month}-${year}`} value={`${month}-${year}`}>
                      {label}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" className="rounded-2xl font-bold">
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Month Alert */}
      {currentMonthContributions.length === 0 && userGroups.length > 0 && (
        <Card className="border-yellow-200/50 bg-yellow-50/80 backdrop-blur-md border-none shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-yellow-800 flex items-center text-base sm:text-lg font-black">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Monthly Contribution Reminder
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700 mb-3 text-sm">
              You haven't made your contribution for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.
            </p>
            <Link href="/contributions/new">
              <Button variant="outline" size="sm" className="w-full sm:w-auto rounded-2xl font-bold bg-white dark:bg-gray-900 border-yellow-300 dark:border-yellow-800 hover:border-yellow-500 hover:text-yellow-600 transition-colors">
                Make Contribution Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="hover:shadow-lg transition-shadow border-none bg-white/60 dark:bg-gray-900/60 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Contributed</CardTitle>
            <div className="p-2 bg-green-50 dark:bg-green-500/10 rounded-xl">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-black">{formatCurrency(totalContributed)}</div>
            <p className="text-[10px] text-gray-500 mt-1">
              {completedContributions.length} completed
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-none bg-white/60 dark:bg-gray-900/60 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pending</CardTitle>
            <div className="p-2 bg-orange-50 dark:bg-orange-500/10 rounded-xl">
              <Calendar className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-black">{pendingContributions.length}</div>
            <p className="text-[10px] text-gray-500 mt-1">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-none bg-white/60 dark:bg-gray-900/60 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Groups</CardTitle>
            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-black">{userGroups.length}</div>
            <p className="text-[10px] text-gray-500 mt-1">
              Groups you belong to
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-none bg-white/60 dark:bg-gray-900/60 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">This Month</CardTitle>
            <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-xl">
              <Calendar className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-black">{currentMonthContributions.length}</div>
            <p className="text-[10px] text-gray-500 mt-1">
              Contributions made
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Groups for Contribution */}
      {userGroups.length > 0 && (
        <Card className="border-none shadow-lg bg-white/40 dark:bg-gray-900/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl font-black">Your Groups</CardTitle>
            <CardDescription className="text-sm">
              Groups where you can make contributions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {userGroups.map((groupMember) => (
                <Card key={groupMember.id} className="group relative hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-dashed border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md">
                  <div className="absolute inset-0 bg-green-400 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity"></div>
                  <CardHeader className="pb-3 relative z-10">
                    <CardTitle className="text-base sm:text-lg font-black truncate">{groupMember.group.name}</CardTitle>
                    <CardDescription className="text-sm">
                      Monthly: {formatCurrency(groupMember.group.monthlyContribution)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <Link href={`/contributions/new?groupId=${groupMember.groupId}`}>
                      <Button size="sm" className="w-full rounded-2xl font-bold bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-green-500 hover:text-green-600 transition-colors">
                        <Plus className="w-4 h-4 mr-2" />
                        Contribute
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contribution History */}
      <Card className="border-none shadow-lg bg-white/40 dark:bg-gray-900/40 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl font-black">Contribution History</CardTitle>
          <CardDescription className="text-sm">
            Your complete contribution record
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredContributions.length > 0 ? (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden sm:table-cell">Group</TableHead>
                    <TableHead className="sm:hidden">Group/Period</TableHead>
                    <TableHead className="hidden sm:table-cell">Amount</TableHead>
                    <TableHead className="hidden sm:table-cell">Period</TableHead>
                    <TableHead className="hidden sm:table-cell">Payment Method</TableHead>
                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContributions.map((contribution) => (
                    <TableRow key={contribution.id}>
                      <TableCell className="hidden sm:table-cell">
                        <div>
                          <p className="font-medium">{contribution.group.name}</p>
                          <p className="text-sm text-gray-500">{contribution.group.region}</p>
                        </div>
                      </TableCell>
                      <TableCell className="sm:hidden">
                        <div className="space-y-1">
                          <div>
                            <p className="font-medium text-sm">{contribution.group.name}</p>
                            <p className="text-xs text-gray-500">{formatCurrency(Number(contribution.amount))}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={
                                contribution.status === 'COMPLETED' ? 'default' :
                                contribution.status === 'PENDING' ? 'secondary' : 'destructive'
                              }
                              className="text-xs"
                            >
                              {contribution.status}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(contribution.year, contribution.month - 1).toLocaleDateString('en-US', {
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {formatCurrency(Number(contribution.amount))}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {new Date(contribution.year, contribution.month - 1).toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {contribution.paymentMethod || '-'}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge 
                          variant={
                            contribution.status === 'COMPLETED' ? 'default' :
                            contribution.status === 'PENDING' ? 'secondary' : 'destructive'
                          }
                        >
                          {contribution.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {formatDate(contribution.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12 px-4">
              <DollarSign className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-black text-gray-900 mb-2">No Contributions Yet</h3>
              <p className="text-gray-500 mb-6 text-sm sm:text-base">
                Start contributing to your village banking groups.
              </p>
              {userGroups.length > 0 ? (
                <Link href="/contributions/new">
                  <Button className="w-full sm:w-auto rounded-2xl font-bold">
                    <Plus className="w-4 h-4 mr-2" />
                    Make First Contribution
                  </Button>
                </Link>
              ) : (
                <Link href="/groups">
                  <Button variant="outline" className="w-full sm:w-auto rounded-2xl font-bold bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-[#6c47ff] hover:text-[#6c47ff] transition-colors">
                    Join a Group First
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
