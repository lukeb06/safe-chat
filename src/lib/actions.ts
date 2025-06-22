'use server';

import { AccessToken, createAccessRefreshPair } from 'simple-web-tokens';
import { prisma } from './prisma';
import type { Message, User } from '../../generated/prisma';
import * as bcrypt from 'bcrypt';

const PKEY = process.env.SECRET || 'key';

export async function getUserFromAccessToken(accessToken: string) {
    try {
        const at = await AccessToken.parse(accessToken, PKEY);

        if (!at || !at.userId) return null;

        const user = await prisma.user.findUnique({
            where: {
                id: at.userId,
            },
        });

        return user;
    } catch (e) {
        return null;
    }
}

export async function getConversations(accessToken: string) {
    const user = await getUserFromAccessToken(accessToken);
    if (!user) return [];

    const conversations = await prisma.message.findMany({
        where: {
            OR: [
                {
                    authorId: user.id,
                },
                {
                    recipientId: user.id,
                },
            ],
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    const recents = new Map<string, Message>();

    return await Promise.all(
        conversations
            .filter(c => {
                const minId = Math.min(c.authorId, c.recipientId);
                const maxId = Math.max(c.authorId, c.recipientId);
                const key = `${minId}-${maxId}`;

                if (recents.has(key)) return false;
                recents.set(key, c);
                return true;
            })
            .map(async c => ({
                ...c,
                author: await prisma.user.findUnique({
                    where: {
                        id: c.authorId,
                    },
                }),
                recipient: await prisma.user.findUnique({
                    where: {
                        id: c.recipientId,
                    },
                }),
            })),
    );
}

export async function login(username: string, password: string) {
    const user = await prisma.user.findUnique({
        where: {
            username,
        },
    });

    if (!user) return null;

    const hash = await bcrypt.hash(password, user.passwordSalt);
    if (hash !== user.passwordHash) return null;

    const [accessToken, _] = await createAccessRefreshPair(user.id, PKEY);

    return accessToken;
}

export async function register(username: string, password: string) {
    const usernameRegex = /^[a-zA-Z0-9_]{3,16}$/;
    if (username.length < 3)
        return { accessToken: null, error: 'Username must be at least 3 characters' };
    if (username.length > 16)
        return { accessToken: null, error: 'Username cannot be more than 16 characters' };
    if (!usernameRegex.test(username)) return { accessToken: null, error: 'Invalid username' };

    const passwordRegex = /^[a-zA-Z0-9!@#$%^&*()_+~-]{8,128}$/;
    if (password.length < 8)
        return { accessToken: null, error: 'Password must be at least 8 characters' };
    if (password.length > 128)
        return { accessToken: null, error: 'Password cannot be more than 128 characters' };
    if (!passwordRegex.test(password)) return { accessToken: null, error: 'Invalid password' };

    const user = await prisma.user.findUnique({
        where: {
            username,
        },
    });

    if (user) return { accessToken: null, error: 'Username already taken' };

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
        data: {
            username,
            passwordSalt: salt,
            passwordHash: hash,
        },
    });

    const [accessToken, _] = await createAccessRefreshPair(newUser.id, PKEY);

    return { accessToken, error: null };
}
