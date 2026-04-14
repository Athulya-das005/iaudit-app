import prisma from './src/prisma.js';

async function checkPasswords() {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, email: true }
        });
        
        console.log("User records:");
        users.forEach(u => {
            console.log(`ID: ${u.id}, Email: ${u.email}`);
        });
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

checkPasswords();
