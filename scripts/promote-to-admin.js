
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function main() {
    const groupId = 'cmklnqgo50001ezhc478qaut5'; // The group we are debugging

    console.log("--- Promote Member to Admin ---");

    // 1. List all members
    const members = await prisma.groupMember.findMany({
        where: { groupId: groupId },
        include: { user: true }
    });

    console.log(`\nCurrent Members in Group (${groupId}):`);
    members.forEach((m, index) => {
        console.log(`${index + 1}. ${m.user.firstName} ${m.user.lastName} (${m.user.email}) - Role: ${m.role}`);
    });

    rl.question('\nEnter the number of the user you want to make ADMIN (or 0 to cancel): ', async (answer) => {
        const index = parseInt(answer) - 1;

        if (index >= 0 && index < members.length) {
            const memberToPromote = members[index];

            console.log(`Promoting ${memberToPromote.user.email} to ADMIN...`);

            try {
                await prisma.groupMember.update({
                    where: { id: memberToPromote.id },
                    data: { role: 'ADMIN' }
                });
                console.log("Success! They are now an ADMIN. Please try saving settings again.");
            } catch (e) {
                console.error("Error updating role:", e);
            }
        } else {
            console.log("Cancelled.");
        }

        await prisma.$disconnect();
        rl.close();
    });
}

main();
