'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, DollarSign, Settings, Plus, Eye, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { useLanguage } from '@/components/providers/LanguageProvider'

interface GroupsContentProps {
    userGroups: any[]
}

export function GroupsContent({ userGroups }: GroupsContentProps) {
    const { t } = useLanguage()

    return (
        <div className="space-y-8 animate-fade-in relative">
            {/* Nano Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mb-8 border-b border-border/50 pb-6">
                <div>
                    <h1 className="text-4xl font-black bg-gradient-to-r from-blue-900 to-indigo-800 dark:from-white dark:to-blue-200 bg-clip-text text-transparent mb-2">
                        {t('groups.my_groups')}
                    </h1>
                    <p className="text-muted-foreground font-medium max-w-lg">
                        {t('groups.manage_desc')}
                    </p>
                </div>
                <Link href="/groups/new">
                    <Button className="w-full sm:w-auto bg-banana hover:bg-yellow-400 text-banana-foreground font-black rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 px-6 h-12">
                        <Plus className="w-5 h-5 mr-2" />
                        {t('groups.create_group')}
                    </Button>
                </Link>
            </div>

            {/* Groups Grid */}
            {userGroups.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userGroups.map((groupMember) => (
                        <Card key={groupMember.id} className="group relative overflow-hidden bg-card border border-border/50 shadow-sm hover:shadow-xl hover:border-banana/30 transition-all duration-300 hover:-translate-y-1">
                            {/* Decorative Glow */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-banana/5 rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity" />

                            <CardHeader className="relative z-10 pb-2">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                                                <span className="font-black text-blue-700 dark:text-blue-300 text-xs">{groupMember.group.name.substring(0, 2).toUpperCase()}</span>
                                            </div>
                                            <Badge
                                                variant={
                                                    groupMember.status === 'ACTIVE' ? 'default' :
                                                        groupMember.status === 'PENDING' ? 'secondary' : 'destructive'
                                                }
                                                className={`shrink-0 font-black text-[10px] uppercase tracking-wider px-2 py-0.5 border-none ${groupMember.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''
                                                    }`}
                                            >
                                                {groupMember.status}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-xl font-bold truncate group-hover:text-blue-600 transition-colors">{groupMember.group.name}</CardTitle>
                                        <CardDescription className="text-sm font-medium line-clamp-2 mt-1 opacity-80">
                                            {groupMember.group.description || t('common.no_description')}
                                        </CardDescription>
                                    </div>
                                    <Link href={`/groups/${groupMember.groupId}`} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="p-2 bg-muted/50 rounded-full hover:bg-banana/20 hover:text-yellow-700 transition-colors">
                                            <ArrowUpRight className="w-4 h-4" />
                                        </div>
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4 relative z-10">
                                {/* Group Role */}
                                <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg border border-border/20">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t('groups.your_role')}</span>
                                    <Badge variant="outline" className="font-black text-[10px] uppercase tracking-wider border-blue-200 text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
                                        {groupMember.role}
                                    </Badge>
                                </div>

                                {/* Group Stats */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex flex-col gap-1 p-3 bg-muted/20 rounded-xl hover:bg-muted/40 transition-colors">
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <Users className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">{t('groups.members')}</span>
                                        </div>
                                        <p className="text-lg font-black text-foreground">{groupMember.group._count.members}</p>
                                    </div>
                                    <div className="flex flex-col gap-1 p-3 bg-muted/20 rounded-xl hover:bg-muted/40 transition-colors">
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <DollarSign className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Monthly</span>
                                        </div>
                                        <p className="text-lg font-black text-foreground truncate">{formatCurrency(groupMember.group.monthlyContribution)}</p>
                                    </div>
                                </div>

                                {/* Group Info */}
                                <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
                                    <div className="px-2 py-1 rounded-md bg-muted/30 text-[10px] font-bold text-muted-foreground uppercase">
                                        {groupMember.group.region}
                                    </div>
                                    <div className="px-2 py-1 rounded-md bg-muted/30 text-[10px] font-bold text-muted-foreground uppercase">
                                        {groupMember.group.interestRate}% Interest
                                    </div>
                                    <div className="px-2 py-1 rounded-md bg-muted/30 text-[10px] font-bold text-muted-foreground uppercase">
                                        {groupMember.group.maxLoanMultiplier}x Max
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 pt-2">
                                    <Link href={`/groups/${groupMember.groupId}`} className="flex-1">
                                        <Button className="w-full rounded-xl font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 shadow-none border border-transparent">
                                            {t('groups.view')}
                                        </Button>
                                    </Link>
                                    {groupMember.role === 'ADMIN' && (
                                        <Link href={`/groups/${groupMember.groupId}/settings`}>
                                            <Button size="icon" variant="outline" className="rounded-xl border-border bg-transparent hover:bg-muted hover:text-foreground">
                                                <Settings className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 px-4 bg-muted/10 rounded-3xl border border-dashed border-border/60">
                    <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
                        <Users className="w-10 h-10 text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-black text-foreground mb-2">{t('groups.no_groups')}</h3>
                    <p className="text-muted-foreground mb-8 text-center max-w-sm font-medium">
                        {t('groups.no_groups_desc')}
                    </p>
                    <Link href="/groups/new">
                        <Button className="rounded-xl font-black px-8 h-12 bg-banana hover:bg-yellow-400 text-banana-foreground shadow-lg hover:scale-105 transition-all">
                            <Plus className="w-5 h-5 mr-2" />
                            {t('groups.create_group')}
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    )
}
