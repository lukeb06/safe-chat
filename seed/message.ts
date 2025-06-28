import { prisma } from '@/lib/prisma';

export async function createMessage(authorId: number, channelName: string, content: string) {
    await prisma.message.create({
        data: {
            authorId,
            channelName,
            content,
        },
    });
}

export async function undoMessage() {
    await prisma.message.deleteMany();
}
