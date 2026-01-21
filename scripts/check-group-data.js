
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const groupId = 'cmklnqgo50001ezhc478qaut5'; // ID from user logs
    console.log(`Fetching group ${groupId}...`);

    try {
        const group = await prisma.group.findUnique({
            where: { id: groupId }
        });

        if (!group) {
            console.log("Group not found!");
            return;
        }

        console.log("Group Data found in DB:");
        console.log("Name:", group.name);
        console.log("Description:", group.description);
        console.log("Monthly Contribution:", group.monthlyContribution);
        console.log("Interest Rate:", group.interestRate);
        console.log("Social Fund:", group.socialFundAmount);
        console.log("Max Loan Multiplier:", group.maxLoanMultiplier);
        console.log("Full Object Keys:", Object.keys(group));

        // Check members
        const members = await prisma.groupMember.findMany({
            where: { groupId: groupId },
            include: { user: true }
        });

        console.log(`\nFound ${members.length} members.`);
        console.log("Admins:");
        members.filter(m => m.role === 'ADMIN').forEach(m => {
            console.log(`- ${m.user.firstName} ${m.user.lastName} (ID: ${m.userId})`);
        });

    } catch (e) {
        console.error("Error fetching group:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
