"use client";

import { useState } from "react";
import { parseTransactionFromText as parseSMS } from "@/lib/sms-parser";
import { createTransaction } from "@/lib/transactions";
import { useRouter } from "next/navigation";
import { TransactionType } from "@prisma/client";
import { Scan, PenTool, Loader2, ArrowRight, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { QRScannerDialog } from "@/components/shared/QRScannerDialog";
import { toast } from "sonner";

type InputMode = "scan" | "manual";

export default function SmartTransactionInput() {
    const [mode, setMode] = useState<"sms" | "manual">("sms");
    const [smsText, setSmsText] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Manual Entry State
    const [manualEntry, setManualEntry] = useState({
        amount: "",
        type: "EXPENSE" as TransactionType,
        description: "",
        date: new Date().toISOString().split("T")[0],
        lendingType: "" as "" | "GIVEN" | "TAKEN",
        personName: "",
        ubankId: "", // Store scanned ID
    });

    const handleQRScan = (decodedText: string) => {
        // Check for uBank URI schema: "ubank://user/<id>"
        if (decodedText.startsWith("ubank://user/")) {
            const ubankId = decodedText.replace("ubank://user/", "");
            setMode("manual");
            setManualEntry(prev => ({
                ...prev,
                lendingType: "GIVEN", // Default to "Lent to..."
                type: "EXPENSE",
                personName: `User: ${ubankId}`, // Show verified ID temporarily
                ubankId: ubankId
            }));
            toast.success("User verified! Please enter amount.");
        } else {
            console.log(`Scan result: ${decodedText}`);
            toast.error("Invalid uBank QR Code");
        }
    };

    const validateQR = (decodedText: string) => {
        if (!decodedText.startsWith("ubank://user/")) {
            return "Invalid QR code. Please scan a valid uBank Personal QR.";
        }
        return null;
    };

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

        if (manualEntry.lendingType && !manualEntry.personName) {
            alert("Please enter the person's name");
            return;
        }

        setLoading(true);
        try {
            await createTransaction({
                amount: parseFloat(manualEntry.amount),
                type: manualEntry.type,
                description: manualEntry.description,
                date: new Date(manualEntry.date),
                lendingType: manualEntry.lendingType as "GIVEN" | "TAKEN" | undefined,
                counterpartyName: manualEntry.personName || undefined,
                counterpartyUbankId: manualEntry.ubankId || undefined
            });

            setManualEntry({
                amount: "",
                type: "EXPENSE",
                description: "",
                date: new Date().toISOString().split("T")[0],
                lendingType: "",
                personName: "",
                ubankId: ""
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
        <div className="p-6 rounded-[2rem] sm:rounded-[2.5rem] h-full relative overflow-hidden bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 shadow-2xl shadow-emerald-900/5">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 relative z-10">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">New Transaction</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Record a new income or expense</p>
                </div>
                <div className="flex items-center p-1 bg-slate-100 dark:bg-black/20 rounded-full border border-slate-200 dark:border-white/10 w-full">
                    <button
                        onClick={() => setMode("sms")}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all min-w-0",
                            mode === "sms"
                                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        )}
                    >
                        <Scan className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">SMS</span>
                    </button>

                    <QRScannerDialog
                        onScan={handleQRScan}
                        title="Scan Personal QR"
                        description="Scan a peer's Personal QR Code to verify them"
                        validationFn={validateQR}
                    >
                        <button
                            className={cn(
                                "flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all min-w-0 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            )}
                        >
                            <ScanLine className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">Code</span>
                        </button>
                    </QRScannerDialog>

                    <button
                        onClick={() => setMode("manual")}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all min-w-0",
                            mode === "manual"
                                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        )}
                    >
                        <PenTool className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Manual</span>
                    </button>
                </div>
            </div>

            {/* Content Body */}
            <div className="space-y-4 relative z-10">
                {mode === "sms" && (
                    <div className="space-y-4">
                        <textarea
                            className="w-full h-32 p-4 rounded-xl bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none text-sm transition-all"
                            placeholder="Paste your bank SMS here..."
                            value={smsText}
                            onChange={(e) => setSmsText(e.target.value)}
                        />
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                            <p className="text-xs text-emerald-400 leading-relaxed">
                                <span className="font-bold">Tip:</span> We automatically detect the amount, date, and transaction type from the SMS.
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
                )}

                {mode === "manual" && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Type</label>
                                <select
                                    className="w-full h-10 px-3 rounded-lg bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm appearance-none"
                                    value={manualEntry.lendingType ? manualEntry.lendingType : manualEntry.type}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === "GIVEN") {
                                            setManualEntry({ ...manualEntry, lendingType: "GIVEN", type: "EXPENSE" });
                                        } else if (val === "TAKEN") {
                                            setManualEntry({ ...manualEntry, lendingType: "TAKEN", type: "INCOME" });
                                        } else {
                                            setManualEntry({ ...manualEntry, lendingType: "", type: val as TransactionType });
                                        }
                                    }}
                                >
                                    <option value="EXPENSE">Expense</option>
                                    <option value="INCOME">Income</option>
                                    <option value="GIVEN">Loan Given</option>
                                    <option value="TAKEN">Loan Taken</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 ml-1">Amount</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">MWK</span>
                                    <input
                                        type="number"
                                        className="w-full h-10 pl-12 pr-3 rounded-lg bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
                                        placeholder="0.00"
                                        value={manualEntry.amount}
                                        onChange={(e) => setManualEntry({ ...manualEntry, amount: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {manualEntry.lendingType && (
                            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Person</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="w-full h-10 px-3 rounded-lg bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
                                        placeholder="Name or uBank ID"
                                        value={manualEntry.personName}
                                        onChange={(e) => setManualEntry({ ...manualEntry, personName: e.target.value })}
                                        disabled={!!manualEntry.ubankId} // Lock if verified via QR
                                    />
                                    {manualEntry.ubankId && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                            VERIFIED
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

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
