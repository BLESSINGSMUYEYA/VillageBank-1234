"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";
import { verifyLending } from "@/lib/transactions";
import { cn } from "@/lib/utils";
import { toast } from "sonner"; // Assuming sonner is used for toasts based on package.json

interface LoanRequestActionProps {
    lendingId: string;
    notificationId: string;
    onComplete: (notificationId: string) => void;
}

export function LoanRequestAction({ lendingId, notificationId, onComplete }: LoanRequestActionProps) {
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState<"idle" | "accepted" | "rejected">("idle");

    const handleAction = (newStatus: "CONFIRMED" | "REJECTED") => {
        startTransition(async () => {
            try {
                await verifyLending(lendingId, newStatus);
                setStatus(newStatus === "CONFIRMED" ? "accepted" : "rejected");
                toast.success(newStatus === "CONFIRMED" ? "Loan Accepted" : "Loan Rejected");

                // Wait a moment before clearing/refreshing
                setTimeout(() => {
                    onComplete(notificationId);
                }, 1500);
            } catch (error) {
                console.error(error);
                toast.error("Failed to process request");
            }
        });
    };

    if (status === "accepted") {
        return <div className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-2 rounded-lg flex items-center gap-2"><Check className="w-4 h-4" /> Accepted</div>
    }

    if (status === "rejected") {
        return <div className="text-xs font-bold text-rose-500 bg-rose-500/10 px-3 py-2 rounded-lg flex items-center gap-2"><X className="w-4 h-4" /> Rejected</div>
    }

    return (
        <div className="flex items-center gap-2 mt-2">
            <Button
                size="sm"
                onClick={(e) => { e.stopPropagation(); handleAction("CONFIRMED"); }}
                disabled={isPending}
                className="h-8 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
            >
                {isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Check className="w-3 h-3 mr-1" />}
                Confirm
            </Button>
            <Button
                size="sm"
                onClick={(e) => { e.stopPropagation(); handleAction("REJECTED"); }}
                disabled={isPending}
                className="h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 font-bold text-xs"
            >
                Reject
            </Button>
        </div>
    );
}
