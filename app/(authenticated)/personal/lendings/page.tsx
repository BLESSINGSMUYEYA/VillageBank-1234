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
        <PageContainer>
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
