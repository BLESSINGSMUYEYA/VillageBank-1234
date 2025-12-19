'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Search, Filter, X, Calendar, DollarSign, Users, FileText } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface SearchFilters {
  query: string
  type: 'all' | 'groups' | 'contributions' | 'loans' | 'activities'
  status?: string
  dateRange?: 'week' | 'month' | 'quarter' | 'year' | 'custom'
  amountRange?: {
    min?: number
    max?: number
  }
  groups?: string[]
  paymentMethods?: string[]
}

interface SearchResult {
  id: string
  type: 'group' | 'contribution' | 'loan' | 'activity'
  title: string
  description: string
  amount?: number
  status?: string
  date: string
  group?: string
  url: string
  metadata?: Record<string, any>
}

interface AdvancedSearchProps {
  onSearch?: (results: SearchResult[]) => void
  placeholder?: string
  showFilters?: boolean
}

export function AdvancedSearch({ 
  onSearch, 
  placeholder = "Search groups, contributions, loans, and activities...",
  showFilters = true 
}: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    type: 'all',
    dateRange: 'month'
  })
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [availableGroups, setAvailableGroups] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    fetchAvailableGroups()
  }, [])

  const fetchAvailableGroups = async () => {
    try {
      const response = await fetch('/api/groups')
      if (response.ok) {
        const data = await response.json()
        setAvailableGroups(data.groups || [])
      }
    } catch (error) {
      console.error('Failed to fetch groups:', error)
    }
  }

  const handleSearch = async () => {
    if (!filters.query.trim() && filters.type === 'all') {
      return
    }

    setLoading(true)
    try {
      const queryParams = new URLSearchParams()
      
      if (filters.query) queryParams.append('q', filters.query)
      if (filters.type !== 'all') queryParams.append('type', filters.type)
      if (filters.status) queryParams.append('status', filters.status)
      if (filters.dateRange) queryParams.append('dateRange', filters.dateRange)
      if (filters.amountRange) {
        if (filters.amountRange.min !== undefined) {
          queryParams.append('minAmount', filters.amountRange.min.toString())
        }
        if (filters.amountRange.max !== undefined) {
          queryParams.append('maxAmount', filters.amountRange.max.toString())
        }
      }
      if (filters.groups?.length) {
        queryParams.append('groups', filters.groups.join(','))
      }
      if (filters.paymentMethods?.length) {
        queryParams.append('paymentMethods', filters.paymentMethods.join(','))
      }

      const response = await fetch(`/api/search?${queryParams.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setResults(data.results || [])
        onSearch?.(data.results || [])
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setFilters({
      query: '',
      type: 'all',
      dateRange: 'month'
    })
    setResults([])
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'group':
        return <Users className="w-4 h-4 text-blue-500" />
      case 'contribution':
        return <DollarSign className="w-4 h-4 text-green-500" />
      case 'loan':
        return <FileText className="w-4 h-4 text-orange-500" />
      case 'activity':
        return <Calendar className="w-4 h-4 text-purple-500" />
      default:
        return <Search className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string, type: string) => {
    if (type === 'loan') {
      switch (status) {
        case 'APPROVED': return 'bg-green-100 text-green-800'
        case 'PENDING': return 'bg-yellow-100 text-yellow-800'
        case 'REJECTED': return 'bg-red-100 text-red-800'
        case 'ACTIVE': return 'bg-blue-100 text-blue-800'
        default: return 'bg-gray-100 text-gray-800'
      }
    }
    
    if (type === 'contribution') {
      switch (status) {
        case 'COMPLETED': return 'bg-green-100 text-green-800'
        case 'PENDING': return 'bg-yellow-100 text-yellow-800'
        case 'FAILED': return 'bg-red-100 text-red-800'
        default: return 'bg-gray-100 text-gray-800'
      }
    }
    
    return 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={placeholder}
            value={filters.query}
            onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </Button>
        {showFilters && (
          <Button
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        )}
        {(filters.query || filters.type !== 'all' || filters.status) && (
          <Button variant="ghost" onClick={clearFilters}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && showAdvancedFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Advanced Filters</CardTitle>
            <CardDescription>
              Narrow down your search results with specific criteria
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Type Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Search Type</label>
                <Select
                  value={filters.type}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, type: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="groups">Groups</SelectItem>
                    <SelectItem value="contributions">Contributions</SelectItem>
                    <SelectItem value="loans">Loans</SelectItem>
                    <SelectItem value="activities">Activities</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Date Range</label>
                <Select
                  value={filters.dateRange}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Last Week</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                    <SelectItem value="quarter">Last Quarter</SelectItem>
                    <SelectItem value="year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select
                  value={filters.status || ''}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, status: value || undefined }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Status</SelectItem>
                    {filters.type === 'loans' && (
                      <>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="APPROVED">Approved</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                      </>
                    )}
                    {filters.type === 'contributions' && (
                      <>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="FAILED">Failed</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Amount Range Filter */}
            {filters.type === 'contributions' || filters.type === 'loans' ? (
              <div>
                <label className="text-sm font-medium mb-2 block">Amount Range (MWK)</label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.amountRange?.min || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      amountRange: {
                        ...prev.amountRange,
                        min: Number(e.target.value) || 0
                      }
                    }))}
                  />
                  <span className="text-gray-500">to</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.amountRange?.max || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      amountRange: {
                        ...prev.amountRange,
                        max: Number(e.target.value) || 0
                      }
                    }))}
                  />
                </div>
              </div>
            ) : null}

            {/* Groups Filter */}
            {(filters.type === 'all' || filters.type === 'contributions' || filters.type === 'loans') && (
              <div>
                <label className="text-sm font-medium mb-2 block">Groups</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {availableGroups.map((group) => (
                    <div key={group.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`group-${group.id}`}
                        checked={filters.groups?.includes(group.id) || false}
                        onCheckedChange={(checked: boolean) => {
                          setFilters(prev => ({
                            ...prev,
                            groups: checked
                              ? [...(prev.groups || []), group.id]
                              : (prev.groups || []).filter(id => id !== group.id)
                          }))
                        }}
                      />
                      <label htmlFor={`group-${group.id}`} className="text-sm">
                        {group.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Methods Filter */}
            {filters.type === 'all' || filters.type === 'contributions' ? (
              <div>
                <label className="text-sm font-medium mb-2 block">Payment Methods</label>
                <div className="space-y-2">
                  {['AIRTEL_MONEY', 'MPAMBA', 'BANK_CARD', 'CASH', 'OTHER'].map((method) => (
                    <div key={method} className="flex items-center space-x-2">
                      <Checkbox
                        id={`payment-${method}`}
                        checked={filters.paymentMethods?.includes(method) || false}
                        onCheckedChange={(checked: boolean) => {
                          setFilters(prev => ({
                            ...prev,
                            paymentMethods: checked
                              ? [...(prev.paymentMethods || []), method]
                              : (prev.paymentMethods || []).filter(m => m !== method)
                          }))
                        }}
                      />
                      <label htmlFor={`payment-${method}`} className="text-sm">
                        {method.replace('_', ' ')}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Search Results</CardTitle>
            <CardDescription>
              Found {results.length} result{results.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => window.location.href = result.url}
                >
                  <div className="flex items-center space-x-3">
                    {getResultIcon(result.type)}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{result.title}</p>
                        {result.status && (
                          <Badge className={getStatusColor(result.status, result.type)}>
                            {result.status}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{result.description}</p>
                      <div className="flex items-center gap-4 mt-1">
                        {result.amount && (
                          <span className="text-sm font-medium">
                            {formatCurrency(result.amount)}
                          </span>
                        )}
                        {result.group && (
                          <span className="text-sm text-gray-500">
                            {result.group}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {new Date(result.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
