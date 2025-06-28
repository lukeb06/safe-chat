import { prisma } from '@/lib/prisma';

export async function createChannel(name: string, ownerId?: number) {
    const data: { name: string; ownerId?: number } = { name };
    if (ownerId) data.ownerId = ownerId;

    await prisma.channel.create({
        data,
    });
}

export async function undoChannel() {
    await prisma.channel.deleteMany();
}
