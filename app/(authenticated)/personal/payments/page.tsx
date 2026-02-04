import { getRecurringPayments } from "@/lib/recurring-payments";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { RecurringPaymentsList } from "@/components/personal/RecurringPaymentsList";
import { RecurringPaymentsModal } from "@/components/personal/RecurringPaymentsModal";
import { ConnectionError } from "@/components/shared/ConnectionError";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function PaymentsPage() {
    const session = await getSession();
    if (!session?.userId) redirect("/login");

    let payments = [];
    let error = null;

    try {
        payments = await getRecurringPayments();
    } catch (e) {
        console.error("Failed to fetch payments:", e);
        error = "Could not connect to the database. Please check your internet connection or try again later.";
    }

    if (error) {
        return (
            <PageContainer className="relative">
                <PageHeader
                    title="Recurring Payments"
                    description="Manage your automatic payment reminders"
                    badge="Personal Finance"
                    backHref="/personal"
                />
                <div className="flex items-center justify-center min-h-[400px]">
                    <ConnectionError message={error} />
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer className="relative">
            {/* Ambient Background Glows - Optimized for performance */}
            <div className="absolute -top-32 -left-32 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute top-1/2 right-0 w-[350px] h-[350px] bg-blue-500/5 rounded-full blur-[80px] pointer-events-none translate-y-[-50%]" />

            <PageHeader
                title="Recurring Payments"
                description="Manage your automatic payment reminders"
                badge="Personal Finance"
                backHref="/personal"
                action={
                    <RecurringPaymentsModal>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Plus className="w-4 h-4" />
                            Add Payment
                        </Button>
                    </RecurringPaymentsModal>
                }
            />

            <div className="animate-fade-in slide-in-from-bottom-4 duration-500">
                <RecurringPaymentsList />
            </div>
        </PageContainer>
    );
}
