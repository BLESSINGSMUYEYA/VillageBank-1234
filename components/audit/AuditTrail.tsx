'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
  History,
  Filter,
  Search,
  Download,
  Calendar,
  Users,
  DollarSign,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ExportButton } from '@/components/export/ExportButton'

interface AuditActivity {
  id: string
  actionType: string
  description: string
  metadata: Record<string, any>
  createdAt: string
  user: {
    firstName: string
    lastName: string
    email: string
  }
  group?: {
    id: string
    name: string
    region: string
  }
  type: 'contribution' | 'loan' | 'group' | 'system'
  severity: 'high' | 'medium' | 'low'
}

interface AuditTrailProps {
  groupId?: string
  showFilters?: boolean
  showExport?: boolean
}

export function AuditTrail({ groupId, showFilters = true, showExport = true }: AuditTrailProps) {
  const [activities, setActivities] = useState<AuditActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    type: 'user',
    dateRange: 'month',
    search: ''
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  })

  const fetchAuditTrail = useCallback(async () => {
    try {
      setLoading(true)

      const queryParams = new URLSearchParams()
      queryParams.append('type', filters.type)
      queryParams.append('dateRange', filters.dateRange)
      queryParams.append('page', pagination.page.toString())
      queryParams.append('limit', pagination.limit.toString())
      if (groupId) queryParams.append('groupId', groupId)

      const response = await fetch(`/api/audit?${queryParams.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setActivities(data.activities || [])
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch audit trail:', error)
    } finally {
      setLoading(false)
    }
  }, [filters, pagination.page, pagination.limit, groupId])

  useEffect(() => {
    fetchAuditTrail()
  }, [fetchAuditTrail, filters, pagination.page])

  const getActivityIcon = (type: string, severity: string) => {
    switch (type) {
      case 'contribution':
        return <DollarSign className="w-4 h-4 text-green-500" />
      case 'loan':
        return <FileText className="w-4 h-4 text-blue-500" />
      case 'group':
        return <Users className="w-4 h-4 text-purple-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="w-3 h-3 text-red-500" />
      case 'medium':
        return <CheckCircle className="w-3 h-3 text-yellow-500" />
      case 'low':
        return <Clock className="w-3 h-3 text-gray-500" />
      default:
        return <Clock className="w-3 h-3 text-gray-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'contribution':
        return 'bg-green-100 text-green-800'
      case 'loan':
        return 'bg-blue-100 text-blue-800'
      case 'group':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredActivities = activities.filter(activity => {
    if (!filters.search) return true
    const searchLower = filters.search.toLowerCase()
    return (
      activity.description.toLowerCase().includes(searchLower) ||
      activity.actionType.toLowerCase().includes(searchLower) ||
      activity.user.firstName.toLowerCase().includes(searchLower) ||
      activity.user.lastName.toLowerCase().includes(searchLower) ||
      activity.group?.name.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Audit Trail</h2>
          <p className="text-gray-600 mt-1">
            Track all activities and system events
          </p>
        </div>
        {showExport && (
          <ExportButton
            data={filteredActivities}
            type="activities"
            title="Audit Trail"
            dateRange={filters.dateRange}
          />
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select
                  value={filters.type}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">My Activities</SelectItem>
                    <SelectItem value="group">Group Activities</SelectItem>
                    <SelectItem value="all">All Activities</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Date Range</label>
                <Select
                  value={filters.dateRange}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Last Week</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                    <SelectItem value="quarter">Last Quarter</SelectItem>
                    <SelectItem value="year">Last Year</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search activities..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex items-end">
                <Button onClick={fetchAuditTrail} disabled={loading}>
                  {loading ? 'Loading...' : 'Apply Filters'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Activities</p>
                <p className="text-2xl font-bold">{pagination.total}</p>
              </div>
              <History className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Severity</p>
                <p className="text-2xl font-bold text-red-600">
                  {activities.filter(a => a.severity === 'high').length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Contributions</p>
                <p className="text-2xl font-bold text-green-600">
                  {activities.filter(a => a.type === 'contribution').length}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Loans</p>
                <p className="text-2xl font-bold text-blue-600">
                  {activities.filter(a => a.type === 'loan').length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activities List */}
      <Card>
        <CardHeader>
          <CardTitle>Activities</CardTitle>
          <CardDescription>
            Showing {filteredActivities.length} of {pagination.total} activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-8">
              <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Activities Found</h3>
              <p className="text-gray-500">
                No activities match your current filters.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      {getActivityIcon(activity.type, activity.severity)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">{activity.description}</p>
                        <Badge className={getTypeColor(activity.type)}>
                          {activity.type}
                        </Badge>
                        <Badge className={getSeverityColor(activity.severity)}>
                          <div className="flex items-center gap-1">
                            {getSeverityIcon(activity.severity)}
                            {activity.severity}
                          </div>
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mb-1">
                        {activity.actionType}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>
                          {activity.user.firstName} {activity.user.lastName}
                        </span>
                        {activity.group && (
                          <span>{activity.group.name}</span>
                        )}
                        <span>{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}</span>
                      </div>
                      {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                            View Details
                          </summary>
                          <pre className="text-xs text-gray-600 mt-1 bg-gray-50 p-2 rounded">
                            {JSON.stringify(activity.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} activities
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
