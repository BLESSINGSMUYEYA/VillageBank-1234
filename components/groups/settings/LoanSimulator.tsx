'use client'

import { useState, useMemo } from 'react'
import { Calculator, ArrowRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { GlassCard } from '@/components/ui/GlassCard'
import { PremiumInput } from '@/components/ui/premium-input'

interface LoanSimulatorProps {
    interestRate: number
    interestType: 'FLAT_RATE' | 'REDUCING_BALANCE'
    maxLoanMultiplier: number
}

export function LoanSimulator({ interestRate, interestType, maxLoanMultiplier }: LoanSimulatorProps) {
    const [simulatedSavings, setSimulatedSavings] = useState('10000')

    const calculations = useMemo(() => {
        const savings = parseFloat(simulatedSavings) || 0
        const maxLoan = savings * maxLoanMultiplier
        const rate = interestRate / 100
        const months = 6 // Standard simulation period

        let totalRepayment = 0
        let monthlyRepayment = 0
        let interestAmount = 0

        if (interestType === 'REDUCING_BALANCE') {
            // PMT = P * r * (1 + r)^n / ((1 + r)^n - 1)
            const monthlyRate = rate // Assuming monthly rate input
            if (monthlyRate > 0) {
                monthlyRepayment = (maxLoan * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
                totalRepayment = monthlyRepayment * months
            } else {
                monthlyRepayment = maxLoan / months
                totalRepayment = maxLoan
            }
        } else {
            // Flat Rate: P * (1 + r * n)
            totalRepayment = maxLoan * (1 + rate * months)
            monthlyRepayment = totalRepayment / months
        }

        interestAmount = totalRepayment - maxLoan

        return {
            maxLoan,
            monthlyRepayment,
            interestAmount,
            totalRepayment
        }
    }, [simulatedSavings, interestRate, interestType, maxLoanMultiplier])

    return (
        <GlassCard className="p-6 mt-6 bg-gradient-to-br from-blue-500/5 to-purple-500/5 border-blue-500/10" hover={false}>
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                    <Calculator className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-black text-sm uppercase tracking-wide">Live Impact Simulator</h4>
                    <p className="text-xs text-muted-foreground">Preview how these rules affect member loans</p>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="text-xs font-bold text-muted-foreground mb-2 block">
                        If a member has saved:
                    </label>
                    <PremiumInput
                        type="number"
                        prefix="MWK"
                        value={simulatedSavings}
                        onChange={(e) => setSimulatedSavings(e.target.value)}
                        className="h-10 text-sm"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10">
                    <div>
                        <p className="text-[10px] uppercase font-black text-muted-foreground mb-1">Max Loan Limit</p>
                        <p className="text-xl font-black text-foreground">{formatCurrency(calculations.maxLoan)}</p>
                        <p className="text-[10px] text-blue-500 font-bold">{maxLoanMultiplier}x Multiplier</p>
                    </div>

                    <div>
                        <p className="text-[10px] uppercase font-black text-muted-foreground mb-1">Monthly Return</p>
                        <p className="text-xl font-black text-foreground">{formatCurrency(calculations.monthlyRepayment)}</p>
                        <p className="text-[10px] text-emerald-500 font-bold">For 6 Months</p>
                    </div>

                    <div>
                        <p className="text-[10px] uppercase font-black text-muted-foreground mb-1">Total Interest</p>
                        <p className="text-xl font-black text-foreground">{formatCurrency(calculations.interestAmount)}</p>
                        <p className="text-[10px] text-purple-500 font-bold">Yield Revenue</p>
                    </div>
                </div>

                <div className="text-[10px] text-center text-muted-foreground bg-black/20 rounded-lg p-3">
                    This simulation assumes a standard <strong>6-month</strong> repayment period using <strong>{interestType === 'FLAT_RATE' ? 'Flat Rate' : 'Reducing Balance'}</strong> calculation.
                </div>
            </div>
        </GlassCard>
    )
}
