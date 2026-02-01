"use client";

import { useState } from "react";
import { parseTransactionFromText as parseSMS } from "@/lib/sms-parser";
import { createTransaction } from "@/lib/transactions";
import { useRouter } from "next/navigation";
import { TransactionType } from "@prisma/client";
import { GlassCard } from "@/components/ui/GlassCard";
import { Scan, PenTool, Loader2, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type InputMode = "scan" | "manual";

export default function SmartTransactionInput() {
    const [mode, setMode] = useState<InputMode>("scan");
    const [smsText, setSmsText] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Manual Entry State
    const [manualEntry, setManualEntry] = useState({
        amount: "",
        type: "EXPENSE" as TransactionType,
        description: "",
        date: new Date().toISOString().split("T")[0],
    });

    const handleSaveParsed = async () => {
        setLoading(true);
        try {
            const parsed = parseSMS(smsText);
            if (!parsed) {
                alert("Could not parse SMS. Please try manual entry.");
                return;
            }

            if (!parsed.amount) {
                alert("Could not detect amount. Please enter manually.");
                return;
            }

            const transactionType: TransactionType = (parsed.type === "INCOME" || parsed.type === "EXPENSE")
                ? parsed.type
                : "EXPENSE";

            await createTransaction({
                amount: parsed.amount,
                type: transactionType,
                description: parsed.description || "Parsed Transaction",
                date: parsed.date || undefined,
            });

            setSmsText("");
            alert("Transaction saved!");
            router.refresh(); // Refresh stats/list
        } catch (error) {
            console.error(error);
            alert("Failed to save transaction.");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveManual = async () => {
        if (!manualEntry.amount || !manualEntry.description) {
            alert("Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            await createTransaction({
                amount: parseFloat(manualEntry.amount),
                type: manualEntry.type,
                description: manualEntry.description,
                date: new Date(manualEntry.date),
            });

            setManualEntry({
                amount: "",
                type: "EXPENSE",
                description: "",
                date: new Date().toISOString().split("T")[0],
            });
            alert("Transaction saved!");
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Failed to save transaction.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 rounded-[2rem] h-full relative overflow-hidden bg-slate-900/90 border border-slate-800 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 relative z-10">
                <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">New Transaction</h2>
                    <p className="text-slate-400 text-xs mt-1">Record a new income or expense</p>
                </div>
                <div className="flex items-center p-1 bg-slate-950 rounded-full border border-slate-800">
                    <button
                        onClick={() => setMode("scan")}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all",
                            mode === "scan"
                                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20"
                                : "text-slate-400 hover:text-white"
                        )}
                    >
                        <Scan className="w-3.5 h-3.5" />
                        Scan
                    </button>
                    <button
                        onClick={() => setMode("manual")}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all",
                            mode === "manual"
                                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20"
                                : "text-slate-400 hover:text-white"
                        )}
                    >
                        <PenTool className="w-3.5 h-3.5" />
                        Manual
                    </button>
                </div>
            </div>

            {/* Content Body */}
            <div className="space-y-4 relative z-10">
                {mode === "scan" ? (
                    <div className="space-y-4">
                        <textarea
                            className="w-full h-32 p-4 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none text-sm transition-all"
                            placeholder="Paste your bank SMS here..."
                            value={smsText}
                            onChange={(e) => setSmsText(e.target.value)}
                        />
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                            <p className="text-xs text-emerald-400 leading-relaxed">
                                <span className="font-bold">Tip:</span> We automatically detect the amount, date, and transaction type (Debit/Credit) from the SMS.
                            </p>
                        </div>
                        <Button
                            onClick={handleSaveParsed}
                            disabled={loading || !smsText}
                            className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-900/20 transition-all"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Process SMS"}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 ml-1">Type</label>
                                <select
                                    className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm appearance-none"
                                    value={manualEntry.type}
                                    onChange={(e) => setManualEntry({ ...manualEntry, type: e.target.value as TransactionType })}
                                >
                                    <option value="EXPENSE">Expense</option>
                                    <option value="INCOME">Income</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 ml-1">Amount</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">MWK</span>
                                    <input
                                        type="number"
                                        className="w-full h-10 pl-12 pr-3 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
                                        placeholder="0.00"
                                        value={manualEntry.amount}
                                        onChange={(e) => setManualEntry({ ...manualEntry, amount: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 ml-1">Description</label>
                            <input
                                type="text"
                                className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
                                placeholder="e.g. Groceries, Salary, Rent"
                                value={manualEntry.description}
                                onChange={(e) => setManualEntry({ ...manualEntry, description: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 ml-1">Date</label>
                            <input
                                type="date"
                                className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
                                value={manualEntry.date}
                                onChange={(e) => setManualEntry({ ...manualEntry, date: e.target.value })}
                            />
                        </div>

                        <Button
                            onClick={handleSaveManual}
                            disabled={loading}
                            className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-900/20 transition-all mt-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <span className="flex items-center gap-2">
                                    Add Transaction <ArrowRight className="w-4 h-4" />
                                </span>
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
