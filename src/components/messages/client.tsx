'use client';

import { getConversations, type PublicUser } from '@/lib/actions';
import type { Message, User } from 'generated/prisma';
import { Link } from 'next-view-transitions';
import { useEffect, useState } from 'react';

export interface Convo extends Message {
    author: PublicUser | null;
    recipient: PublicUser | null;
}
export default function ConvosClient({
    convos,
    user,
    accessToken,
}: {
    convos: Convo[];
    user: User;
    accessToken: string;
}) {
    const [_convos, setConvos] = useState(convos);

    useEffect(() => {
        const interval = setInterval(async () => {
            const convos = await getConversations(accessToken);
            if (!document.startViewTransition) return setConvos(convos);
            document.startViewTransition(() => {
                setConvos(convos);
            });
        }, 10000);

        return () => clearInterval(interval);
    });

    return _convos.map(c => {
        const otherUser = c.authorId !== user.id ? c.author : c.recipient;
        return (
            <Link
                key={c.id}
                href={`/app/messages/${otherUser?.id}`}
                className="flex items-center gap-4 py-2 px-4 hover:bg-foreground/5 rounded cursor-pointer"
                style={{ viewTransitionName: `convo-${otherUser?.id}` }}
            >
                <div className="h-8 w-8 rounded-full bg-foreground/10" />
                <div className="flex flex-col gap-1">
                    <span>{otherUser?.displayName || otherUser?.username}</span>
                    <span className="text-foreground/75">
                        {c.content.length > 10 ? c.content.slice(0, 10) + '...' : c.content}
                    </span>
                </div>
            </Link>
        );
    });
}
