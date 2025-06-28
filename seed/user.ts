import { prisma } from '@/lib/prisma';
import * as bcrypt from 'bcrypt';
import { createMessage } from './message';
import { createChannel } from './channel';

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

    await createChannel('global');
    await createChannel('web-dev', user1.id);
    await createChannel('web-design', user2.id);
    await createChannel('mobile-dev', user3.id);
    await createChannel('mobile-design', user4.id);

    await createMessage(user1.id, 'global', 'Hello world!');
    await createMessage(user1.id, 'web-dev', 'Hey!');
    await createMessage(user1.id, 'web-design', 'Whats up!');
    await createMessage(user2.id, 'web-design', 'Hey!');
    await createMessage(user3.id, 'mobile-dev', 'Hey!');
    await createMessage(user4.id, 'mobile-design', 'Whats up!');
    await createMessage(user4.id, 'mobile-design', 'Hey!');
    await createMessage(user4.id, 'mobile-design', 'Hey!');
}

export async function undoUser() {
    await prisma.user.deleteMany();
}
