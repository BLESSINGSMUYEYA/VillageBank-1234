"use client";

import { useState, useEffect } from "react";
import { parseTransactionFromText as parseSMS } from "@/lib/sms-parser";
import { createTransaction, getRecentCounterparties } from "@/lib/transactions";
import { useRouter } from "next/navigation";
import { TransactionType } from "@prisma/client";
import { Scan, PenTool, Loader2, ArrowRight, ScanLine, Clock, MessageSquareText } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { QRScannerDialog } from "@/components/shared/QRScannerDialog";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription
} from "@/components/ui/dialog";

export default function SmartTransactionInput() {
    const [isSmsOpen, setIsSmsOpen] = useState(false);
    const [isManualOpen, setIsManualOpen] = useState(false);

    const [smsText, setSmsText] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Recent Users State
    const [recentUsers, setRecentUsers] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        getRecentCounterparties().then(setRecentUsers);
    }, []);

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

            // Open manual dialog with pre-filled data
            setManualEntry(prev => ({
                ...prev,
                lendingType: "GIVEN", // Default to "Lent to..."
                type: "EXPENSE",
                personName: `User: ${ubankId}`, // Show verified ID temporarily
                ubankId: ubankId
            }));
            setIsManualOpen(true); // Open the manual entry dialog

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
                toast.error("Could not parse SMS. Please try manual entry.");
                return;
            }

            if (!parsed.amount) {
                toast.error("Could not detect amount. Please enter manually.");
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
            setIsSmsOpen(false);
            toast.success("Transaction saved!");
            router.refresh(); // Refresh stats/list
        } catch (error) {
            console.error(error);
            toast.error("Failed to save transaction.");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveManual = async () => {
        if (!manualEntry.amount || !manualEntry.description) {
            toast.error("Please fill in all fields");
            return;
        }

        if (manualEntry.lendingType && !manualEntry.personName) {
            toast.error("Please enter the person's name");
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
            setIsManualOpen(false);
            toast.success("Transaction saved!");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Failed to save transaction.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 rounded-[2rem] sm:rounded-[2.5rem] h-full relative overflow-hidden bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 shadow-2xl shadow-emerald-900/5">
            {/* Header */}
            <div className="flex flex-col gap-4 relative z-10 h-full">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">New Transaction</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Record a new income or expense</p>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-auto mb-auto">
                    {/* SMS Button */}
                    <Dialog open={isSmsOpen} onOpenChange={setIsSmsOpen}>
                        <DialogTrigger asChild>
                            <button className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 border border-slate-200 dark:border-white/10 hover:border-emerald-200 dark:hover:border-emerald-500/20 transition-all group aspect-square">
                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 group-hover:bg-emerald-500 group-hover:text-white flex items-center justify-center transition-colors text-slate-600 dark:text-slate-400">
                                    <MessageSquareText className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">SMS</span>
                            </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Parse Transaction SMS</DialogTitle>
                                <DialogDescription>Paste your bank SMS to automatically extract details.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <textarea
                                    className="w-full h-32 p-4 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none text-sm"
                                    placeholder="Paste your bank SMS here..."
                                    value={smsText}
                                    onChange={(e) => setSmsText(e.target.value)}
                                />
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                                        Amount, date, and type will be auto-detected.
                                    </p>
                                </div>
                                <Button
                                    onClick={handleSaveParsed}
                                    disabled={loading || !smsText}
                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Process SMS"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* QR Code Button */}
                    <QRScannerDialog
                        onScan={handleQRScan}
                        title="Scan Personal QR"
                        description="Scan a peer's Personal QR Code to verify them"
                        validationFn={validateQR}
                    >
                        <button className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 border border-slate-200 dark:border-white/10 hover:border-emerald-200 dark:hover:border-emerald-500/20 transition-all group aspect-square">
                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 group-hover:bg-emerald-500 group-hover:text-white flex items-center justify-center transition-colors text-slate-600 dark:text-slate-400">
                                <ScanLine className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">Scan QR</span>
                        </button>
                    </QRScannerDialog>

                    {/* Manual Button */}
                    <Dialog open={isManualOpen} onOpenChange={setIsManualOpen}>
                        <DialogTrigger asChild>
                            <button className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 border border-slate-200 dark:border-white/10 hover:border-emerald-200 dark:hover:border-emerald-500/20 transition-all group aspect-square">
                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 group-hover:bg-emerald-500 group-hover:text-white flex items-center justify-center transition-colors text-slate-600 dark:text-slate-400">
                                    <PenTool className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">Manual</span>
                            </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg overflow-visible">
                            <DialogHeader>
                                <DialogTitle>New Transaction</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-2">
                                {/* Recent Users Section */}
                                {recentUsers.length > 0 && (
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> Recent
                                        </label>
                                        <ScrollArea className="w-full whitespace-nowrap pb-2" orientation="horizontal">
                                            <div className="flex w-max space-x-3">
                                                {recentUsers.map((user, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => {
                                                            setManualEntry(prev => ({
                                                                ...prev,
                                                                lendingType: prev.lendingType || "GIVEN",
                                                                type: prev.lendingType === "TAKEN" ? "INCOME" : "EXPENSE",
                                                                personName: user.name,
                                                                ubankId: user.ubankId || ""
                                                            }));
                                                            toast.success(`Selected ${user.displayName || user.name}`);
                                                        }}
                                                        className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group"
                                                    >
                                                        <Avatar className="w-10 h-10 border-2 border-white dark:border-white/10 group-hover:border-emerald-500/50 transition-colors">
                                                            <AvatarFallback className="bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-xs">
                                                                {user.displayName?.substring(0, 2).toUpperCase() || "UN"}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 max-w-[4rem] truncate">
                                                            {user.displayName?.split(" ")[0] || user.name}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Type</label>
                                        <select
                                            className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm appearance-none"
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
                                        <label className="text-xs font-bold text-slate-400">Amount</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">MWK</span>
                                            <input
                                                type="number"
                                                className="w-full h-10 pl-12 pr-3 rounded-lg bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
                                                placeholder="0.00"
                                                value={manualEntry.amount}
                                                onChange={(e) => setManualEntry({ ...manualEntry, amount: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {manualEntry.lendingType && (
                                    <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Person</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
                                                placeholder="Name or uBank ID"
                                                value={manualEntry.personName}
                                                onChange={(e) => {
                                                    setManualEntry({ ...manualEntry, personName: e.target.value, ubankId: "" });
                                                    setShowSuggestions(true);
                                                }}
                                                onFocus={() => setShowSuggestions(true)}
                                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                                disabled={!!manualEntry.ubankId}
                                                autoComplete="off"
                                            />
                                            {showSuggestions && manualEntry.personName && !manualEntry.ubankId && (
                                                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg shadow-xl z-50 max-h-40 overflow-y-auto">
                                                    {recentUsers
                                                        .filter(u =>
                                                            (u.displayName || u.name).toLowerCase().includes(manualEntry.personName.toLowerCase())
                                                        )
                                                        .map((u, i) => (
                                                            <button
                                                                key={i}
                                                                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-between"
                                                                onClick={() => {
                                                                    setManualEntry(prev => ({
                                                                        ...prev,
                                                                        personName: u.name,
                                                                        ubankId: u.ubankId || ""
                                                                    }));
                                                                    setShowSuggestions(false);
                                                                }}
                                                            >
                                                                <span className="text-slate-700 dark:text-slate-200">{u.displayName || u.name}</span>
                                                                {u.ubankId && <span className="text-[10px] text-emerald-500 bg-emerald-500/10 px-1.5 rounded">VERIFIED</span>}
                                                            </button>
                                                        ))}
                                                </div>
                                            )}
                                            {manualEntry.ubankId && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                                    VERIFIED
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400">Description</label>
                                    <input
                                        type="text"
                                        className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
                                        placeholder="e.g. Groceries, Salary, Rent"
                                        value={manualEntry.description}
                                        onChange={(e) => setManualEntry({ ...manualEntry, description: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400">Date</label>
                                    <input
                                        type="date"
                                        className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
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
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}
