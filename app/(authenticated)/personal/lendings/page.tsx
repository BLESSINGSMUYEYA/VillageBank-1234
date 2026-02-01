import { getLendings } from "@/lib/lendings";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import LendingList from "@/components/personal/LendingList"; // Assuming this is where I put it

export default async function LendingsPage() {
    const session = await getSession();
    if (!session?.userId) redirect("/login");

    const lendings = await getLendings();

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
