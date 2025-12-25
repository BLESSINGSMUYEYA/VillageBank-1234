'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, DollarSign, Settings, Plus, Eye } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { useLanguage } from '@/components/providers/LanguageProvider'

interface GroupsContentProps {
    userGroups: any[]
}

export function GroupsContent({ userGroups }: GroupsContentProps) {
    const { t } = useLanguage()

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                    <h1 className="text-display font-black text-blue-900 dark:text-blue-100">{t('groups.my_groups')}</h1>
                    <p className="text-body text-muted-foreground">{t('groups.manage_desc')}</p>
                </div>
                <Link href="/groups/new">
                    <Button className="w-full sm:w-auto rounded-xl font-black bg-blue-900 hover:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-600">
                        <Plus className="w-4 h-4 mr-2" />
                        {t('groups.create_group')}
                    </Button>
                </Link>
            </div>

            {/* Groups Grid */}
            {userGroups.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {userGroups.map((groupMember) => (
                        <Card key={groupMember.id} className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="relative z-10 pb-2">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="min-w-0 flex-1">
                                        <CardTitle className="text-h3 truncate">{groupMember.group.name}</CardTitle>
                                        <CardDescription className="text-body line-clamp-2 mt-1">
                                            {groupMember.group.description || t('common.no_description')}
                                        </CardDescription>
                                    </div>
                                    <Badge
                                        variant={
                                            groupMember.status === 'ACTIVE' ? 'default' :
                                                groupMember.status === 'PENDING' ? 'secondary' : 'destructive'
                                        }
                                        className="shrink-0 font-black text-[10px] uppercase tracking-wider px-2 py-0.5"
                                    >
                                        {groupMember.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4 relative z-10">
                                {/* Group Role */}
                                <div className="flex items-center justify-between p-2 bg-muted/50 rounded-xl">
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('groups.your_role')}</span>
                                    <Badge variant="outline" className="font-black text-[10px] uppercase tracking-wider">{groupMember.role}</Badge>
                                </div>

                                {/* Group Stats */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-2">
                                        <div className="p-2 bg-green-50 dark:bg-green-900 rounded-xl">
                                            <Users className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-black truncate text-foreground">{groupMember.group._count.members}</p>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('groups.members')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-xl">
                                            <DollarSign className="w-4 h-4 text-blue-700 dark:text-blue-300 shrink-0" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-black truncate text-foreground">{formatCurrency(groupMember.group.monthlyContribution)}</p>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('dashboard.monthly_contribution')}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Group Info */}
                                <div className="space-y-2 pt-2 border-t border-border">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t('groups.region')}</span>
                                        <span className="text-xs font-black truncate text-right text-foreground">{groupMember.group.region}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t('groups.interest_rate')}</span>
                                        <span className="text-xs font-black text-foreground">{groupMember.group.interestRate}%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t('groups.multiplier')}</span>
                                        <span className="text-xs font-black text-foreground">{groupMember.group.maxLoanMultiplier}x</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                                    <Link href={`/groups/${groupMember.groupId}`} className="flex-1">
                                        <Button variant="outline" size="sm" className="w-full rounded-xl font-black bg-card border-border hover:border-blue-700 hover:text-blue-700 transition-colors">
                                            <Eye className="w-4 h-4 mr-2" />
                                            {t('groups.view')}
                                        </Button>
                                    </Link>
                                    {groupMember.role === 'ADMIN' && (
                                        <Link href={`/groups/${groupMember.groupId}/settings`} className="flex-1">
                                            <Button variant="outline" size="sm" className="w-full rounded-xl font-black bg-card border-border hover:border-blue-700 hover:text-blue-700 transition-colors">
                                                <Settings className="w-4 h-4 mr-2" />
                                                {t('common.settings')}
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="border border-border shadow-sm bg-card">
                    <CardContent className="text-center py-8 sm:py-12 px-4">
                        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-h3 text-foreground mb-2">{t('groups.no_groups')}</h3>
                        <p className="text-body text-muted-foreground mb-6">
                            {t('groups.no_groups_desc')}
                        </p>
                        <Link href="/groups/new">
                            <Button className="w-full sm:w-auto rounded-xl font-black px-8 bg-blue-900 hover:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-600">
                                <Plus className="w-4 h-4 mr-2" />
                                {t('groups.create_group')}
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
