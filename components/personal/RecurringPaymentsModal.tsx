"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Loader2, Calendar } from "lucide-react";
import { createMultipleRecurringPayments } from "@/lib/recurring-payments";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { RecurringPaymentFrequency } from "@prisma/client";

interface PaymentItem {
    name: string;
    description: string;
    amount: string;
}

export function RecurringPaymentsModal({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [frequency, setFrequency] = useState<RecurringPaymentFrequency>("MONTHLY");
    const [incomeDay, setIncomeDay] = useState<string>("1");
    const [paymentItems, setPaymentItems] = useState<PaymentItem[]>([
        { name: "", description: "", amount: "" }
    ]);

    const addPaymentItem = () => {
        setPaymentItems([...paymentItems, { name: "", description: "", amount: "" }]);
    };

    const removePaymentItem = (index: number) => {
        if (paymentItems.length > 1) {
            setPaymentItems(paymentItems.filter((_, i) => i !== index));
        }
    };

    const updatePaymentItem = (index: number, field: keyof PaymentItem, value: string) => {
        const updated = [...paymentItems];
        updated[index][field] = value;
        setPaymentItems(updated);
    };

    const handleSubmit = async () => {
        // Validation
        const validItems = paymentItems.filter(item => item.name && item.amount);

        if (validItems.length === 0) {
            toast.error("Please add at least one payment with name and amount");
            return;
        }

        setLoading(true);
        try {
            const payments = validItems.map(item => ({
                name: item.name,
                description: item.description || undefined,
                amount: parseFloat(item.amount),
                frequency,
                incomeDay: frequency === "MONTHLY" ? parseInt(incomeDay) : undefined,
                startDate: new Date()
            }));

            await createMultipleRecurringPayments(payments);

            toast.success(`Added ${payments.length} recurring payment(s)`);
            setOpen(false);

            // Reset form
            setPaymentItems([{ name: "", description: "", amount: "" }]);
            setFrequency("MONTHLY");
            setIncomeDay("1");

            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Failed to create recurring payments");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Manage Recurring Payments</DialogTitle>
                    <DialogDescription>
                        Set up automatic payment reminders for your regular expenses
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Frequency Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            Payment Frequency
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setFrequency("WEEKLY")}
                                className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${frequency === "WEEKLY"
                                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
                                        : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                                    }`}
                            >
                                <Calendar className="w-4 h-4 inline mr-2" />
                                Weekly
                            </button>
                            <button
                                type="button"
                                onClick={() => setFrequency("MONTHLY")}
                                className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${frequency === "MONTHLY"
                                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
                                        : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                                    }`}
                            >
                                <Calendar className="w-4 h-4 inline mr-2" />
                                Monthly
                            </button>
                        </div>
                    </div>

                    {/* Income Day (for monthly) */}
                    {frequency === "MONTHLY" && (
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                Income Day (Day of Month)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="31"
                                value={incomeDay}
                                onChange={(e) => setIncomeDay(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                placeholder="e.g., 25"
                            />
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                The day you receive your monthly income (1-31)
                            </p>
                        </div>
                    )}

                    {/* Payment Items */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                Payment Items
                            </label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addPaymentItem}
                                className="gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add Payment
                            </Button>
                        </div>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                            {paymentItems.map((item, index) => (
                                <div
                                    key={index}
                                    className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 space-y-3"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 space-y-3">
                                            {/* Name */}
                                            <input
                                                type="text"
                                                value={item.name}
                                                onChange={(e) => updatePaymentItem(index, "name", e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
                                                placeholder="Payment name (e.g., Rent, Electricity)"
                                            />

                                            {/* Description */}
                                            <input
                                                type="text"
                                                value={item.description}
                                                onChange={(e) => updatePaymentItem(index, "description", e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
                                                placeholder="Description (optional)"
                                            />

                                            {/* Amount */}
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                                                    MWK
                                                </span>
                                                <input
                                                    type="number"
                                                    value={item.amount}
                                                    onChange={(e) => updatePaymentItem(index, "amount", e.target.value)}
                                                    className="w-full pl-12 pr-3 py-2 rounded-lg bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>

                                        {/* Remove Button */}
                                        {paymentItems.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removePaymentItem(index)}
                                                className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-900/20 transition-all"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            `Save ${paymentItems.filter(i => i.name && i.amount).length} Payment(s)`
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
