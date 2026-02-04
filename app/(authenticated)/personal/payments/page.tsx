import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { EnhancedPaymentsList } from "@/components/personal/EnhancedPaymentsList";
import { RecurringPaymentsModal } from "@/components/personal/RecurringPaymentsModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function PaymentsPage() {
    const session = await getSession();
    if (!session?.userId) redirect("/login");

    return (
        <PageContainer className="relative">
            {/* Ambient Background Glows - Optimized for performance */}
            <div className="absolute -top-32 -left-32 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute top-1/2 right-0 w-[350px] h-[350px] bg-blue-500/5 rounded-full blur-[80px] pointer-events-none translate-y-[-50%]" />

            <PageHeader
                title="Payment Management"
                description="Track your automatic payments and monthly expenses"
                badge="Personal Finance"
                backHref="/personal"
            />

            <div className="animate-fade-in slide-in-from-bottom-4 duration-500">
                <EnhancedPaymentsList />
            </div>
        </PageContainer>
    );
}
