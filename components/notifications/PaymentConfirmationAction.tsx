"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { confirmRecurringPayment } from "@/lib/recurring-payments";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface PaymentConfirmationActionProps {
    confirmationId: string;
    paymentName: string;
    amount: number;
    onConfirm?: () => void;
}

export function PaymentConfirmationAction({
    confirmationId,
    paymentName,
    amount,
    onConfirm
}: PaymentConfirmationActionProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await confirmRecurringPayment(confirmationId);
            toast.success(`${paymentName} payment confirmed!`);
            onConfirm?.();
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Failed to confirm payment");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10">
            <div className="flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {paymentName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    MWK {amount.toLocaleString()}
                </p>
            </div>
            <Button
                onClick={handleConfirm}
                disabled={loading}
                size="sm"
                className="gap-2 bg-emerald-600 hover:bg-emerald-500"
            >
                {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <>
                        <Check className="w-4 h-4" />
                        Confirm
                    </>
                )}
            </Button>
        </div>
    );
}
