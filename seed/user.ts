import { prisma } from '@/lib/prisma';
import * as bcrypt from 'bcrypt';
import { createMessage } from './message';

async function createUser(username: string, password: string) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    return await prisma.user.create({
        data: {
            username,
            passwordSalt: salt,
            passwordHash: hash,
        },
    });
}

export async function seedUser() {
    const user1 = await createUser('demouser1', 'password');
    const user2 = await createUser('demouser2', 'password1');
    const user3 = await createUser('demouser3', 'password2');
    const user4 = await createUser('demouser4', 'password3');

    await createMessage(user1.id, user2.id, 'User 1 to User 2');
    await createMessage(user1.id, user3.id, 'User 1 to User 3');
    await createMessage(user1.id, user4.id, 'User 1 to User 4');
    await createMessage(user2.id, user1.id, 'User 2 to User 1');
    await createMessage(user2.id, user3.id, 'User 2 to User 3');
    await createMessage(user2.id, user4.id, 'User 2 to User 4');
    await createMessage(user3.id, user1.id, 'User 3 to User 1');
    await createMessage(user3.id, user2.id, 'User 3 to User 2');
    await createMessage(user3.id, user4.id, 'User 3 to User 4');
    await createMessage(user4.id, user1.id, 'User 4 to User 1');
    await createMessage(user4.id, user2.id, 'User 4 to User 2');
    await createMessage(user4.id, user3.id, 'User 4 to User 3');
}

export async function undoUser() {
    await prisma.user.deleteMany();
}
