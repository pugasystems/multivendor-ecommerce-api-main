import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main(): Promise<void> {
    await prisma.role.createMany({
        data: [
            { name: "Admin" },
            { name: "Vendor" },
            { name: "Customer" },
        ],
    });

    const adminRole = await prisma.role.findFirst({ where: { name: "Admin" } });

    await prisma.user.create({
        data: {
            firstName: process.env.SUPER_ADMIN_FIRST_NAME,
            lastName: process.env.SUPER_ADMIN_LAST_NAME,
            email: process.env.SUPER_ADMIN_EMAIL,
            password: await hash(process.env.SUPER_ADMIN_PASSWORD, parseInt(process.env.SALT_ROUNDS)),
            isActive: true,
            hasVerified: true,
            role: {
                connect: {
                    id: adminRole.id,
                },
            },
        },
    });
}

main()
    .catch((e) => {
        console.log(e);
        process.exit(1);
    })
    .finally(() => {
        prisma.$disconnect;
    });