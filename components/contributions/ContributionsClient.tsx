'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Calendar, DollarSign, TrendingUp, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useLanguage } from '@/components/providers/LanguageProvider'

interface ContributionsClientProps {
    contributions: any[]
    userGroups: any[]
    params: any
}

export function ContributionsClient({ contributions, userGroups, params }: ContributionsClientProps) {
    const { t } = useLanguage()

    // Calculate stats
    const completedContributions = contributions.filter(c => c.status === 'COMPLETED')
    const pendingContributions = contributions.filter(c => c.status === 'PENDING')
    const totalContributed = completedContributions.reduce((sum, c) => sum + Number(c.amount), 0)

    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()
    const currentMonthContributions = contributions.filter(
        c => c.month === currentMonth && c.year === currentYear
    )
    const currentMonthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                    <h1 className="text-display font-black text-blue-900 dark:text-blue-100">{t('contributions.title')}</h1>
                    <p className="text-body text-muted-foreground">{t('contributions.subtitle')}</p>
                </div>
                {userGroups.length > 0 && (
                    <Link href="/contributions/new">
                        <Button className="w-full sm:w-auto rounded-xl font-black bg-blue-900 hover:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-600 shadow-sm hover:shadow-md transition-all h-12">
                            <Plus className="w-5 h-5 mr-1" />
                            {t('contributions.make_contribution')}
                        </Button>
                    </Link>
                )}
            </div>

            {/* Filters */}
            <Card className="bg-card border border-border shadow-sm">
                <CardHeader>
                    <CardTitle className="text-h3 flex items-center text-foreground">
                        <Filter className="w-5 h-5 mr-2" />
                        {t('contributions.filters')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder={t('contributions.search_placeholder')}
                                className="pl-10 rounded-xl"
                                defaultValue={params.search || ''}
                            />
                        </div>

                        <Select defaultValue={params.status || 'all'}>
                            <SelectTrigger className="rounded-xl">
                                <SelectValue placeholder={t('contributions.all_statuses')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('contributions.all_statuses')}</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                <SelectItem value="REJECTED">Rejected</SelectItem>
                                <SelectItem value="FAILED">Failed</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select defaultValue={params.groupId || 'all'}>
                            <SelectTrigger className="rounded-xl">
                                <SelectValue placeholder={t('contributions.all_groups')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('contributions.all_groups')}</SelectItem>
                                {userGroups.map((groupMember) => (
                                    <SelectItem key={groupMember.groupId} value={groupMember.groupId}>
                                        {groupMember.group.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select defaultValue={params.month && params.year ? `${params.month}-${params.year}` : 'all'}>
                            <SelectTrigger className="rounded-xl">
                                <SelectValue placeholder={t('contributions.all_time')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('contributions.all_time')}</SelectItem>
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
                        <Button variant="ghost" size="sm" className="rounded-xl font-bold text-gray-500 hover:text-gray-900">
                            {t('contributions.clear_filters')}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Current Month Alert */}
            {currentMonthContributions.length === 0 && userGroups.length > 0 && (
                <Card className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-orange-800 dark:text-orange-300 flex items-center text-h3">
                            <Calendar className="w-5 h-5 mr-2" />
                            {t('contributions.reminder_title')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-orange-700 dark:text-orange-400 mb-3 text-body">
                            {t('contributions.reminder_desc').replace('{month}', currentMonthName)}
                        </p>
                        <Link href="/contributions/new">
                            <Button className="w-full sm:w-auto rounded-xl font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-none border-none">
                                {t('contributions.make_now')}
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Card className="bg-card border border-border shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black text-muted-foreground uppercase tracking-widest">{t('contributions.total_contributed')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-h2 font-black text-foreground">{formatCurrency(totalContributed)}</div>
                        <p className="text-xs text-muted-foreground mt-1">{completedContributions.length} completed</p>
                    </CardContent>
                </Card>

                <Card className="bg-card border border-border shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black text-muted-foreground uppercase tracking-widest">{t('contributions.pending')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-h2 font-black text-foreground">{pendingContributions.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">{t('contributions.awaiting_approval')}</p>
                    </CardContent>
                </Card>

                <Card className="bg-card border border-border shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black text-muted-foreground uppercase tracking-widest">{t('contributions.active_groups')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-h2 font-black text-foreground">{userGroups.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Belonging to</p>
                    </CardContent>
                </Card>

                <Card className="bg-card border border-border shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black text-muted-foreground uppercase tracking-widest">{t('contributions.this_month')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-h2 font-black text-foreground">{currentMonthContributions.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Made</p>
                    </CardContent>
                </Card>
            </div>

            {/* Contribution History */}
            <Card className="bg-card border border-border shadow-sm">
                <CardHeader>
                    <CardTitle className="text-h2 text-blue-900 dark:text-blue-100">{t('contributions.contribution_history')}</CardTitle>
                    <CardDescription className="text-body text-muted-foreground">{t('contributions.history_desc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {contributions.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="font-black text-blue-900 dark:text-blue-100">Group</TableHead>
                                        <TableHead className="font-black text-blue-900 dark:text-blue-100">Amount</TableHead>
                                        <TableHead className="font-black text-blue-900 dark:text-blue-100">Period</TableHead>
                                        <TableHead className="font-black text-blue-900 dark:text-blue-100">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {contributions.map((contribution) => (
                                        <TableRow key={contribution.id}>
                                            <TableCell className="font-medium text-body text-foreground">{contribution.group.name}</TableCell>
                                            <TableCell className="font-black text-body text-green-600 dark:text-green-400">{formatCurrency(Number(contribution.amount))}</TableCell>
                                            <TableCell className="text-body text-muted-foreground">
                                                {new Date(contribution.year, contribution.month - 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className="rounded-lg font-bold">
                                                    {contribution.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <h3 className="text-h3 text-foreground">{t('contributions.no_contributions')}</h3>
                            <p className="text-body mb-6 text-muted-foreground">{t('contributions.no_contributions_desc')}</p>
                            {userGroups.length > 0 ? (
                                <Link href="/contributions/new">
                                    <Button className="rounded-xl font-black bg-blue-900 hover:bg-blue-800 text-white dark:bg-blue-700 dark:hover:bg-blue-600">{t('contributions.first_contribution')}</Button>
                                </Link>
                            ) : (
                                <Link href="/groups">
                                    <Button variant="outline" className="rounded-xl font-black border-border hover:border-blue-700 hover:text-blue-700">{t('contributions.join_first')}</Button>
                                </Link>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
