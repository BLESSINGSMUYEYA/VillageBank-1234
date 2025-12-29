'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Calendar, DollarSign, Search, Filter } from 'lucide-react'
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
        <div className="space-y-8 animate-fade-in pb-10 relative">
            {/* Nano Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mb-8 border-b border-border/50 pb-6">
                <div>
                    <h1 className="text-4xl font-black bg-gradient-to-r from-blue-900 to-indigo-800 dark:from-white dark:to-blue-200 bg-clip-text text-transparent mb-2">
                        {t('contributions.title')}
                    </h1>
                    <p className="text-muted-foreground font-medium max-w-lg">
                        {t('contributions.subtitle')}
                    </p>
                </div>
                {userGroups.length > 0 && (
                    <Link href="/contributions/new">
                        <Button className="w-full sm:w-auto bg-banana hover:bg-yellow-400 text-banana-foreground font-black rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 px-6 h-12">
                            <Plus className="w-5 h-5 mr-2" />
                            {t('contributions.make_contribution')}
                        </Button>
                    </Link>
                )}
            </div>

            {/* Stats Cards - Bento Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Card className="bg-card border border-border/50 shadow-sm hover:shadow-md transition-shadow dark:bg-card/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t('contributions.total_contributed')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl sm:text-3xl font-black text-blue-900 dark:text-banana">{formatCurrency(totalContributed)}</div>
                        <p className="text-xs text-muted-foreground mt-1 font-medium">{completedContributions.length} completed transactions</p>
                    </CardContent>
                </Card>

                <Card className={`border shadow-sm transition-shadow ${pendingContributions.length > 0 ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800' : 'bg-card border-border/50'}`}>
                    <CardHeader className="pb-2">
                        <CardTitle className={`text-[10px] font-black uppercase tracking-widest ${pendingContributions.length > 0 ? 'text-orange-700 dark:text-orange-400' : 'text-muted-foreground'}`}>{t('contributions.pending')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl sm:text-3xl font-black ${pendingContributions.length > 0 ? 'text-orange-900 dark:text-orange-100' : 'text-foreground'}`}>{pendingContributions.length}</div>
                        <p className={`text-xs mt-1 font-medium ${pendingContributions.length > 0 ? 'text-orange-700/80 dark:text-orange-300' : 'text-muted-foreground'}`}>{t('contributions.awaiting_approval')}</p>
                    </CardContent>
                </Card>

                <Card className="bg-card border border-border/50 shadow-sm hover:shadow-md transition-shadow dark:bg-card/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t('contributions.this_month')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl sm:text-3xl font-black text-foreground">{currentMonthContributions.length}</div>
                        <div className="flex items-center gap-1 mt-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            <p className="text-xs text-muted-foreground font-medium">Active Period</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Reminder Card */}
                {currentMonthContributions.length === 0 && userGroups.length > 0 ? (
                    <Link href="/contributions/new" className="block h-full">
                        <Card className="h-full bg-gradient-to-br from-banana to-yellow-500 border-none shadow-lg hover:brightness-105 transition-all cursor-pointer group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full blur-xl -mr-10 -mt-10" />
                            <CardHeader className="pb-1 relative z-10">
                                <CardTitle className="text-[10px] font-black text-yellow-900 uppercase tracking-widest flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> Reminder
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <div className="text-lg font-black text-white leading-tight mb-1">Missed Contribution?</div>
                                <p className="text-xs text-yellow-900/80 font-bold">Tap to pay for {currentMonthName}</p>
                            </CardContent>
                        </Card>
                    </Link>
                ) : (
                    <Card className="bg-blue-900 border border-blue-800 shadow-sm dark:bg-blue-950">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-black text-blue-300 uppercase tracking-widest">{t('contributions.active_groups')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl sm:text-3xl font-black text-white">{userGroups.length}</div>
                            <p className="text-xs text-blue-200 mt-1 font-medium">Participating groups</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Filters */}
            <div className="bg-card/50 backdrop-blur-md border border-border/50 rounded-2xl p-4 shadow-sm sticky top-24 z-20">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder={t('contributions.search_placeholder')}
                            className="pl-10 rounded-xl bg-background border-border/50 focus-visible:ring-banana/50"
                            defaultValue={params.search || ''}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                        <Select defaultValue={params.status || 'all'}>
                            <SelectTrigger className="rounded-xl w-[140px] bg-background border-border/50">
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
                            <SelectTrigger className="rounded-xl w-[180px] bg-background border-border/50">
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
                            <SelectTrigger className="rounded-xl w-[160px] bg-background border-border/50">
                                <SelectValue placeholder={t('contributions.all_time')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('contributions.all_time')}</SelectItem>
                                {Array.from({ length: 12 }, (_, i) => {
                                    const date = new Date()
                                    date.setDate(1)
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

                        <Button variant="ghost" size="icon" className="rounded-xl shrink-0" title="Clear Filters">
                            <Filter className="w-4 h-4 text-muted-foreground" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Contribution History Table */}
            <Card className="bg-card border border-border/50 shadow-lg overflow-hidden rounded-3xl">
                <CardHeader className="border-b border-border/50 bg-muted/20">
                    <CardTitle className="text-xl font-black text-foreground">{t('contributions.contribution_history')}</CardTitle>
                    <CardDescription className="text-sm font-medium">{t('contributions.history_desc')}</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {contributions.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="font-extrabold text-foreground text-xs uppercase tracking-wider py-4">Group</TableHead>
                                        <TableHead className="font-extrabold text-foreground text-xs uppercase tracking-wider text-right">Amount</TableHead>
                                        <TableHead className="font-extrabold text-foreground text-xs uppercase tracking-wider">Period</TableHead>
                                        <TableHead className="font-extrabold text-foreground text-xs uppercase tracking-wider text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {contributions.map((contribution) => (
                                        <TableRow key={contribution.id} className="hover:bg-muted/40 transition-colors border-border/50">
                                            <TableCell className="font-bold text-sm text-foreground py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-[10px] font-black text-blue-700 dark:text-blue-300">
                                                        {contribution.group.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    {contribution.group.name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-black text-sm text-green-600 dark:text-banana text-right">{formatCurrency(Number(contribution.amount))}</TableCell>
                                            <TableCell className="text-sm font-medium text-muted-foreground">
                                                {new Date(contribution.year, contribution.month - 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Badge className={`rounded-lg font-bold border-none px-2.5 py-1 ${contribution.status === 'COMPLETED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                    contribution.status === 'PENDING' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}>
                                                    {contribution.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-16 px-4">
                            <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
                                <DollarSign className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">{t('contributions.no_contributions')}</h3>
                            <p className="text-muted-foreground mb-8 text-sm max-w-sm mx-auto">{t('contributions.no_contributions_desc')}</p>
                            {userGroups.length > 0 ? (
                                <Link href="/contributions/new">
                                    <Button className="rounded-xl font-black bg-banana hover:bg-yellow-400 text-banana-foreground px-6">{t('contributions.first_contribution')}</Button>
                                </Link>
                            ) : (
                                <Link href="/groups">
                                    <Button variant="outline" className="rounded-xl font-bold">{t('contributions.join_first')}</Button>
                                </Link>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
