import { prisma } from '@/lib/prisma';

async function createMessage(authorId: number, recipientId: number, content: string) {
    await prisma.message.create({
        data: {
            authorId,
            recipientId,
            content,
        },
    });
}

export async function seedMessage() {
    await createMessage(1, 2, 'Hello world!');
    await createMessage(2, 1, 'Hey!');
    await createMessage(1, 3, 'Hello world!');
    await createMessage(3, 1, 'Hey!');
    await createMessage(4, 1, 'Hello world!');
    await createMessage(1, 4, 'Hey!');
}

export async function undoMessage() {
    await prisma.message.deleteMany();
}
