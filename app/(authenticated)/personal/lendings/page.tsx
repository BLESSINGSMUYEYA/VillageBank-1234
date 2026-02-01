import { getLendings } from "@/lib/lendings";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import LendingList from "@/components/personal/LendingList";
import { ConnectionError } from "@/components/shared/ConnectionError";

export default async function LendingsPage() {
    const session = await getSession();
    if (!session?.userId) redirect("/login");

    let lendings = [];
    let error = null;

    try {
        lendings = await getLendings();
    } catch (e) {
        console.error("Failed to fetch lendings:", e);
        error = "Could not connect to the database. Please check your internet connection or try again later.";
    }

    if (error) {
        return (
            <PageContainer className="relative">
                <PageHeader
                    title="Lendings & Debts"
                    description="Manage money you owe and money owed to you"
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
            {/* Ambient Background Glows */}
            <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none translate-y-[-50%]" />

            <PageHeader
                title="Lendings & Debts"
                description="Manage money you owe and money owed to you"
                badge="Personal Finance"
                backHref="/personal"
            />

            <div className="animate-fade-in slide-in-from-bottom-4 duration-500">
                <LendingList lendings={lendings} />
            </div>
        </PageContainer>
    );
}
