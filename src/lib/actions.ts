'use server';

import { AccessToken, createAccessRefreshPair } from 'simple-web-tokens';
import { prisma } from './prisma';
import type { Channel, Message, User } from '../../generated/prisma';
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

export interface PublicUser {
    id: number;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
}
export async function getPublicUser(accessToken: string, userId: number) {
    const myUser = await getUserFromAccessToken(accessToken);
    if (!myUser) return null;

    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
        },
    });

    return user;
}

export async function editMessage(accessToken: string, messageId: number, newContent: string) {
    const myUser = await getUserFromAccessToken(accessToken);
    if (!myUser) return null;

    const message = await prisma.message.findUnique({
        where: {
            id: messageId,
        },
    });

    if (!message) return null;
    if (message.authorId !== myUser.id) return null;

    const newMessage = await prisma.message.update({
        where: {
            id: messageId,
        },
        data: {
            content: `${newContent} (edited)`,
        },
    });

    return newMessage;
}

export async function deleteMessage(accessToken: string, messageId: number) {
    const myUser = await getUserFromAccessToken(accessToken);
    if (!myUser) return null;

    const message = await prisma.message.findUnique({
        where: {
            id: messageId,
        },
    });

    if (!message) return null;
    if (message.authorId !== myUser.id) return null;

    await prisma.message.delete({
        where: {
            id: messageId,
        },
    });

    return true;
}

export async function getChannels(accessToken: string) {
    const myUser = await getUserFromAccessToken(accessToken);
    if (!myUser) return { myChannels: [], otherChannels: [] };

    const channels = await prisma.channel.findMany({
        orderBy: {
            id: 'asc',
        },
    });

    const myChannels = channels.filter(c => c.ownerId === myUser.id);
    const otherChannels = channels.filter(c => c.ownerId !== myUser.id);

    return { myChannels, otherChannels };
}

export async function createChannel(name: string, accessToken: string) {
    const myUser = await getUserFromAccessToken(accessToken);
    if (!myUser) return null;

    const existingChannel = await prisma.channel.findUnique({
        where: {
            name,
        },
    });
    if (existingChannel) return null;

    if (name === 'new') return null;
    if (name === 'edit') return null;

    const channel = await prisma.channel.create({
        data: {
            name,
            ownerId: myUser.id,
        },
    });

    return channel;
}

export async function getMessagesFromChannel(channelName: string, accessToken: string) {
    const myUser = await getUserFromAccessToken(accessToken);
    if (!myUser) return [];

    const messages = await prisma.message.findMany({
        where: {
            channelName,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return await Promise.all(
        messages.map(async m => ({ ...m, author: await getPublicUser(accessToken, m.authorId) })),
    );
}

export async function renameChannel(accessToken: string, channelId: number, newName: string) {
    const myUser = await getUserFromAccessToken(accessToken);
    if (!myUser) return null;

    const channel = await prisma.channel.findUnique({
        where: {
            id: channelId,
        },
    });

    if (!channel) return null;
    if (channel.ownerId !== myUser.id) return null;

    const existingChannel = await prisma.channel.findUnique({
        where: {
            name: newName,
        },
    });
    if (existingChannel) return null;

    if (newName === 'new') return null;
    if (newName === 'edit') return null;

    const newChannel = await prisma.channel.update({
        where: {
            id: channelId,
        },
        data: {
            name: newName,
        },
    });

    return newChannel;
}

export async function deleteChannel(accessToken: string, channelId: number) {
    const myUser = await getUserFromAccessToken(accessToken);
    if (!myUser) return null;

    const channel = await prisma.channel.findUnique({
        where: {
            id: channelId,
        },
    });

    if (!channel) return null;
    if (channel.ownerId !== myUser.id) return null;

    await prisma.channel.delete({
        where: {
            id: channelId,
        },
    });

    return true;
}
