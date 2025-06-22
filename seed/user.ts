import { prisma } from '@/lib/prisma';
import * as bcrypt from 'bcrypt';

async function createUser(username: string, password: string) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    await prisma.user.create({
        data: {
            username,
            passwordSalt: salt,
            passwordHash: hash,
        },
    });
}

export async function seedUser() {
    await createUser('demouser1', 'password');
    await createUser('demouser2', 'password1');
    await createUser('demouser3', 'password2');
    await createUser('demouser4', 'password3');
}

export async function undoUser() {
    await prisma.user.deleteMany();
}
