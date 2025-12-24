'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, CreditCard, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useLanguage } from '@/components/providers/LanguageProvider'

interface LoansClientProps {
    loans: any[]
    eligibilityChecks: any[]
}

export function LoansClient({ loans, eligibilityChecks }: LoansClientProps) {
    const { t } = useLanguage()

    // Calculate loan stats
    const activeLoans = loans.filter(l => l.status === 'ACTIVE')
    const pendingLoans = loans.filter(l => l.status === 'PENDING')
    const completedLoans = loans.filter(l => l.status === 'COMPLETED')

    const totalBorrowed = loans
        .filter(l => l.status === 'ACTIVE' || l.status === 'COMPLETED')
        .reduce((sum, l) => sum + Number(l.amountApproved || l.amountRequested), 0)

    const totalRepaid = loans
        .filter(l => l.status === 'COMPLETED')
        .reduce((sum, l) => sum + l.repayments.reduce((repSum: number, rep: any) => repSum + Number(rep.amount), 0), 0)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                    <h1 className="text-display text-gray-900">{t('loans.title')}</h1>
                    <p className="text-body text-gray-600">{t('loans.subtitle')}</p>
                </div>
                {eligibilityChecks.some(check => check.eligible) && (
                    <Link href="/loans/new">
                        <Button className="w-full sm:w-auto rounded-2xl font-black shadow-lg hover:shadow-xl transition-all h-12">
                            <Plus className="w-5 h-5 mr-1" />
                            {t('loans.request_loan')}
                        </Button>
                    </Link>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Card className="border-none shadow-md bg-white/60 dark:bg-gray-900/60 backdrop-blur-md">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('loans.active_loans')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-h2 text-blue-600">{activeLoans.length}</div>
                        <p className="text-xs text-gray-500 mt-1">
                            {formatCurrency(activeLoans.reduce((sum, l) => sum + Number(l.amountApproved || l.amountRequested), 0))}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-white/60 dark:bg-gray-900/60 backdrop-blur-md">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('loans.pending_approval')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-h2 text-orange-600">{pendingLoans.length}</div>
                        <p className="text-xs text-gray-500 mt-1">Awaiting review</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-white/60 dark:bg-gray-900/60 backdrop-blur-md">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('loans.total_borrowed')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-h2 text-purple-600">{formatCurrency(totalBorrowed)}</div>
                        <p className="text-xs text-gray-500 mt-1">{completedLoans.length} completed</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-white/60 dark:bg-gray-900/60 backdrop-blur-md">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('loans.total_repaid')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-h2 text-green-600">{formatCurrency(totalRepaid)}</div>
                        <p className="text-xs text-gray-500 mt-1">Successfully repaid</p>
                    </CardContent>
                </Card>
            </div>

            {/* Loan Eligibility */}
            <Card className="border-none shadow-xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-md">
                <CardHeader>
                    <CardTitle className="text-h2">{t('loans.eligibility_title')}</CardTitle>
                    <CardDescription className="text-body">{t('loans.eligibility_desc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {eligibilityChecks.map((check) => (
                            <Card key={check.group.id} className={`group border-none shadow-sm ${check.eligible ? 'bg-green-50/50' : 'bg-gray-50/50'}`}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-h3 flex items-center">
                                        {check.eligible ? <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" /> : <AlertCircle className="w-5 h-5 mr-2 text-yellow-600" />}
                                        {check.group.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-1 mb-4">
                                        <p className="text-sm font-bold">{check.eligible ? t('loans.eligible') : t('loans.not_eligible')}</p>
                                        <p className="text-xs text-gray-500">{t('loans.max_amount')}: {formatCurrency(check.maxLoanAmount)}</p>
                                    </div>
                                    {check.eligible && (
                                        <Link href={`/loans/new?groupId=${check.group.id}`}>
                                            <Button size="sm" className="w-full rounded-xl font-black">Apply Now</Button>
                                        </Link>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Loan History */}
            <Card className="border-none shadow-xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-md">
                <CardHeader>
                    <CardTitle className="text-h2">{t('loans.loan_history')}</CardTitle>
                    <CardDescription className="text-body">{t('loans.history_desc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {loans.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="font-black">Group</TableHead>
                                        <TableHead className="font-black">Amount</TableHead>
                                        <TableHead className="font-black">Status</TableHead>
                                        <TableHead className="font-black">Applied</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loans.map((loan) => (
                                        <TableRow key={loan.id}>
                                            <TableCell className="font-medium text-body">{loan.group.name}</TableCell>
                                            <TableCell className="font-black text-body">{formatCurrency(Number(loan.amountApproved || loan.amountRequested))}</TableCell>
                                            <TableCell>
                                                <Badge className="font-bold">{loan.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-body">{formatDate(loan.createdAt)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-h3">{t('loans.no_loans')}</h3>
                            <p className="text-body mb-6">{t('loans.no_loans_desc')}</p>
                            {eligibilityChecks.some(check => check.eligible) ? (
                                <Link href="/loans/new">
                                    <Button className="rounded-xl font-black">{t('loans.apply_first')}</Button>
                                </Link>
                            ) : (
                                <Link href="/contributions">
                                    <Button variant="outline" className="rounded-xl font-black">{t('loans.make_contributions_first')}</Button>
                                </Link>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
