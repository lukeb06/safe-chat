import { prisma } from '@/lib/prisma';

export async function createMessage(authorId: number, recipientId: number, content: string) {
    await prisma.message.create({
        data: {
            authorId,
            recipientId,
            content,
        },
    });
}

export async function undoMessage() {
    await prisma.message.deleteMany();
}
